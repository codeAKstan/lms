import { SignJWT, jwtVerify } from 'jose';

// In Edge functions, process.env is accessible directly.
// Use Supabase Anon Key as the signing secret since it's available in all environments.
const secretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default_cth_secret';
const key = new TextEncoder().encode(secretKey);

export async function signRoleCookie(role: string): Promise<string> {
    return await new SignJWT({ role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifyRoleCookie(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload.role as string;
    } catch {
        return null;
    }
}
