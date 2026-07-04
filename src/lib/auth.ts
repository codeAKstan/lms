"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

/**
 * Shared auth utility for Server Actions.
 * Authenticates the caller via cookies and returns user info with role.
 */
export async function requireAuth() {
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
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, email: true },
    });

    if (!dbUser) {
        throw new Error("User not found in database");
    }

    return dbUser;
}

/**
 * Require that the caller has one of the specified roles.
 * Throws if not authenticated or role does not match.
 */
export async function requireRole(...roles: string[]) {
    const user = await requireAuth();
    if (!roles.includes(user.role)) {
        throw new Error("Forbidden: insufficient permissions");
    }
    return user;
}
