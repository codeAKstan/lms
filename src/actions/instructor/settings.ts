"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

export async function getInstructorProfile() {
    noStore();
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true, 
                bio: true, 
                avatar: true,
                honorific: true,
                title: true,
                expertise: true,
                payoutMethod: true,
                payoutAccountName: true,
                payoutAccountNumber: true,
                payoutBankName: true
            }
        });

        return profile;
    } catch (error) {
        console.error("Failed to fetch instructor profile:", error);
        return null;
    }
}

export async function updateInstructorProfile(data: { 
    name: string; 
    bio: string; 
    avatar: string;
    honorific?: string;
    title?: string;
    expertise?: string;
    payoutMethod?: string;
    payoutAccountName?: string;
    payoutAccountNumber?: string;
    payoutBankName?: string;
}) {
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                bio: data.bio,
                avatar: data.avatar,
                honorific: data.honorific,
                title: data.title,
                expertise: data.expertise,
                payoutMethod: data.payoutMethod,
                payoutAccountName: data.payoutAccountName,
                payoutAccountNumber: data.payoutAccountNumber,
                payoutBankName: data.payoutBankName,
            }
        });

        revalidatePath("/instructor/settings");
        revalidatePath("/(marketing)");
        revalidatePath("/(marketing)/courses");
        revalidatePath("/(marketing)/courses/[slug]");

        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to update profile";
        console.error("Profile update error:", msg);
        throw new Error(msg);
    }
}

export async function getNotificationPrefs() {
    noStore();
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const row = await prisma.user.findUnique({
            where: { id: user.id },
            select: { notificationPrefs: true }
        });

        if (!row?.notificationPrefs) return { enrollment: true, completion: true, marketing: false };

        const prefs = typeof row.notificationPrefs === 'string'
            ? JSON.parse(row.notificationPrefs)
            : row.notificationPrefs as { enrollment?: boolean; completion?: boolean; marketing?: boolean };

        return {
            enrollment: prefs.enrollment ?? true,
            completion: prefs.completion ?? true,
            marketing: prefs.marketing ?? false,
        };
    } catch (error) {
        console.error("Failed to get notification prefs:", error);
        return { enrollment: true, completion: true, marketing: false };
    }
}

export async function updateNotificationPrefs(prefs: { enrollment: boolean; completion: boolean; marketing: boolean }) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.user.update({
            where: { id: user.id },
            data: { notificationPrefs: prefs }
        });

        revalidatePath("/instructor/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update notification prefs:", error);
        return { success: false };
    }
}
