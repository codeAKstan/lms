import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Ephemeral cache stores rate limit state in Edge memory to drastically reduce network calls to Redis
const cache = new Map();

const globalRatelimit = redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(500, "10 s"), 
        analytics: true,
        ephemeralCache: cache,
      })
    : null;

const authRatelimit = redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(15, "60 s"), 
        analytics: true,
        ephemeralCache: cache,
      })
    : null;

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Edge Rate Limiting (Protects API and Pages)
    if (globalRatelimit && authRatelimit) {
        const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? '127.0.0.1';
        
        const path = request.nextUrl.pathname;
        const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');
        
        // Choose the appropriate limiter based on route
        const activeLimiter = isAuthRoute ? authRatelimit : globalRatelimit;
        
        try {
            const { success, limit, reset, remaining } = await activeLimiter.limit(
                isAuthRoute ? `auth_${ip}` : `global_${ip}`
            );
            
            if (!success) {
                return new NextResponse('Too Many Requests', {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString()
                    }
                });
            }
        } catch (error) {
            // If Redis is unreachable (e.g., fetch failed, wrong URL, offline),
            // fail OPEN so the application doesn't completely break for users.
            console.error('[Middleware] Rate limiting failed:', error);
        }
    }

    // Polyfill createMiddlewareClient with @supabase/ssr
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Define Protected Route Prefixes
    const isAdminRoute = path.startsWith('/admin');
    const isInstructorRoute = path.startsWith('/instructor');
    const isStudentRoute = path.startsWith('/student');

    // Auth Check
    if (!user) {
        if (isAdminRoute || isInstructorRoute || isStudentRoute) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/login'
            redirectUrl.searchParams.set('redirect', path)
            return NextResponse.redirect(redirectUrl)
        }
    } else {
        // Role Check via Secure Edge Cookie (Eliminates DB Query)
        if (isAdminRoute || isInstructorRoute || isStudentRoute) {
            // First try reading from the signed cookie set during login
            let userRole = null;
            const roleCookie = request.cookies.get('cth_user_role')?.value;
            
            if (roleCookie) {
                // verifyRoleCookie isn't imported yet, we'll need to import it
                // We'll decode the JWT payload using jose
                try {
                    const { jwtVerify } = await import('jose');
                    const secretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default_cth_secret';
                    const key = new TextEncoder().encode(secretKey);
                    const { payload } = await jwtVerify(roleCookie, key);
                    userRole = payload.role;
                } catch {
                    // Invalid cookie, ignore
                }
            }

            // Fallback: If cookie is missing or invalid, do a DB lookup
            // (This only happens once if the cookie was cleared or expired before the session)
            if (!userRole) {
                const { data: userRoleData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                userRole = userRoleData?.role;
            }

            if (isAdminRoute && userRole !== 'ADMIN') {
                return NextResponse.rewrite(new URL('/403', request.url))
            }

            if (isInstructorRoute && userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
                return NextResponse.rewrite(new URL('/403', request.url))
            }
        }

        if (path === '/login' || path === '/register') {
            let userRole = null;
            const roleCookie = request.cookies.get('cth_user_role')?.value;
            
            if (roleCookie) {
                try {
                    const { jwtVerify } = await import('jose');
                    const secretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default_cth_secret';
                    const key = new TextEncoder().encode(secretKey);
                    const { payload } = await jwtVerify(roleCookie, key);
                    userRole = payload.role;
                } catch {
                    // Invalid cookie
                }
            }

            if (!userRole) {
                const { data: roleData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                userRole = roleData?.role;
            }

            let destination = '/student/courses'
            if (userRole === 'ADMIN') destination = '/admin/dashboard'
            else if (userRole === 'INSTRUCTOR') destination = '/instructor/dashboard'

            return NextResponse.redirect(new URL(destination, request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
