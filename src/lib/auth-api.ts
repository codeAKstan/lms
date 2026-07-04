import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { User } from "@supabase/supabase-js";

/**
 * Shared auth utility for API Routes.
 * Supports both Bearer token auth (client-side calls) and cookie-based auth (server-side calls).
 * Returns the Supabase user or null.
 */
export async function getAuthenticatedUser(req: Request): Promise<User | null> {
    // Try Bearer token first (used by client components calling API routes)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (token) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user ?? null;
    }

    // Fall back to cookie-based auth (used by server components / direct browser calls)
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user ?? null;
    } catch {
        return null;
    }
}

/**
 * Get the authenticated user or return a 401 response.
 * Convenience wrapper that throws if not authenticated.
 */
export async function requireApiAuth(req: Request) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

/**
 * Get the authenticated user's role from the database.
 * Returns user with role or null.
 */
export async function getAuthenticatedUserWithRole(req: Request) {
    const user = await getAuthenticatedUser(req);
    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, email: true },
    });

    return dbUser;
}
