"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Validates the authenticated user from cookies
 */
async function requireAuth() {
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

    return { user, supabase };
}

/**
 * PROFILE TAB
 */
export async function getStudentProfile() {
    noStore();
    try {
        const { user } = await requireAuth();

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                email: true,
                bio: true,
                avatar: true,
                createdAt: true
            }
        });

        return { success: true, data: profile };
    } catch (error) {
        console.error("Failed to fetch student profile:", error);
        return { success: false, error: "Failed to load profile" };
    }
}

export async function updateStudentProfile(data: { name: string; email: string; bio: string; avatar?: string }) {
    try {
        const { user, supabase } = await requireAuth();

        // If email changed, we need to instruct Supabase Auth first
        if (data.email && data.email !== user.email) {
            const { error: authError } = await supabase.auth.updateUser({
                email: data.email
            });
            if (authError) throw new Error(authError.message);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                email: data.email, // Kept synced with Supabase
                bio: data.bio,
                ...(data.avatar && { avatar: data.avatar })
            }
        });

        // Reconfirm custom claims / metadata in Supabase
        await supabase.auth.updateUser({
            data: {
                full_name: data.name,
                ...(data.avatar && { avatar_url: data.avatar })
            }
        });

        revalidatePath("/student/settings");
        return { success: true };
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to update profile";
        console.error("Profile update error:", msg);
        return { success: false, error: msg };
    }
}

/**
 * NOTIFICATION TAB
 */
export async function getNotificationPreferences() {
    noStore();
    try {
        const { user } = await requireAuth();
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { notificationPrefs: true }
        });

        const defaultPrefs = {
            courseUpdates: true,
            quizReminders: true,
            certificateReady: true,
            marketingEmails: false,
        };

        const currentPrefs = dbUser?.notificationPrefs 
            ? (dbUser.notificationPrefs as unknown as typeof defaultPrefs)
            : defaultPrefs;

        return { success: true, data: currentPrefs };
    } catch (error) {
        console.error("Failed to fetch notification prefs:", error);
        return { success: false, error: "Failed to load preferences" };
    }
}

export async function updateNotificationPreferences(data: {
    courseUpdates: boolean;
    quizReminders: boolean;
    certificateReady: boolean;
    marketingEmails: boolean;
}) {
    try {
        const { user } = await requireAuth();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                notificationPrefs: data as unknown as Record<string, boolean>
            }
        });
        revalidatePath("/student/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update notification prefs:", error);
        return { success: false, error: "Update failed" };
    }
}

/**
 * BILLING TAB
 */
export async function getStudentPayments() {
    noStore();
    try {
        const { user } = await requireAuth();

        const payments = await prisma.payment.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        enrollments: {
                            select: {
                                course: { select: { id: true, title: true } }
                            }
                        }
                    }
                }
            }
        });

        // Map the payment's courseId to the actual course Title from their enrollments to save a direct cross-join
        const enrichedPayments = payments.map(p => {
            const matchedEnrollment = p.user?.enrollments.find(e => e.course.id === p.courseId);
            return {
                id: p.id,
                courseTitle: matchedEnrollment?.course.title || "Unknown Course / Product",
                amount: p.amount,
                currency: p.currency,
                date: p.createdAt,
                status: p.status
            };
        });

        return { success: true, data: enrichedPayments };
    } catch (error) {
        console.error("Failed to fetch payment history:", error);
        return { success: false, error: "Failed to load payments" };
    }
}
