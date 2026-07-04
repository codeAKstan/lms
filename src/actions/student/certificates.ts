"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Validates the authenticated user from cookies
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * Fetches a Certificate by its unique public ID
 * This is public intentionally so employers/LinkedIn viewers can verify Certificates
 */
export async function getCertificatePreview(certificateId: string) {
    noStore();
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId }
        });

        if (!certificate) {
            return { success: false, error: "Certificate not found or invalid" };
        }

        return {
            success: true,
            data: {
                id: certificate.id,
                studentName: certificate.studentName,
                courseName: certificate.courseName,
                issuedAt: certificate.issuedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                verificationCode: certificate.verificationCode
            }
        };

    } catch (error) {
        console.error("Failed to load certificate:", error);
        return { success: false, error: "Failed to verify certificate" };
    }
}

/**
 * Fetches all certificates earned by the logged-in student
 */
export async function getStudentCertificates(userId: string) {
    noStore();
    try {
        const certs = await prisma.certificate.findMany({
            where: { userId },
            orderBy: { issuedAt: 'desc' }
        });

        return {
            success: true,
            data: certs.map(c => ({
                id: c.id,
                courseName: c.courseName,
                issuedAt: c.issuedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                verificationCode: c.verificationCode
            }))
        };
    } catch (error) {
        console.error('Failed to fetch student certificates:', error);
        return { success: false, error: 'Failed to load certificates' };
    }
}
