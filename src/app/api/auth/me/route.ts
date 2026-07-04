import { NextResponse } from "next/server";
import { getAuthenticatedUserWithRole } from "@/lib/auth-api";
import { signRoleCookie } from "@/lib/auth-token";

/**
 * GET /api/auth/me
 * Returns the current user's role so client components can redirect appropriately.
 * It also provisions the `cth_user_role` cookie for Edge Middleware fast role checking.
 */
export async function GET(req: Request) {
    const user = await getAuthenticatedUserWithRole(req);

    if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const response = NextResponse.json({ user });
    
    if (user.role) {
        const token = await signRoleCookie(user.role);
        response.cookies.set("cth_user_role", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
    }

    return response;
}
