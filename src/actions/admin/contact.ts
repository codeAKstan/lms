"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

// Get all contact submissions
export async function getContactSubmissions() {
    noStore();
    await requireRole('ADMIN');
    try {
        const submissions = await prisma.contactSubmission.findMany({
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: submissions };
    } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return { success: false, error: "Failed to fetch submissions" };
    }
}

// Get submissions by status
export async function getContactSubmissionsByStatus(status: string) {
    noStore();
    await requireRole('ADMIN');
    try {
        const submissions = await prisma.contactSubmission.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: submissions };
    } catch (error) {
        console.error(`Error fetching ${status} submissions:`, error);
        return { success: false, error: "Failed to fetch submissions" };
    }
}

// Update submission status
export async function updateSubmissionStatus(id: string, status: string) {
    await requireRole('ADMIN');
    try {
        const submission = await prisma.contactSubmission.update({
            where: { id },
            data: { status },
        });

        revalidatePath("/admin/contact");

        return { success: true, data: submission };
    } catch (error) {
        console.error(`Error updating submission ${id} status:`, error);
        return { success: false, error: "Failed to update status" };
    }
}

// Delete a submission
export async function deleteContactSubmission(id: string) {
    await requireRole('ADMIN');
    try {
        await prisma.contactSubmission.delete({
            where: { id },
        });

        revalidatePath("/admin/contact");

        return { success: true };
    } catch (error) {
        console.error(`Error deleting submission ${id}:`, error);
        return { success: false, error: "Failed to delete submission" };
    }
}

// Create a contact submission (public-facing)
export async function createContactSubmission(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) {
    try {
        const submission = await prisma.contactSubmission.create({
            data: {
                id: `contact-${Date.now()}`,
                ...data,
                status: "unread",
            },
        });

        revalidatePath("/admin/contact");

        return { success: true, data: submission };
    } catch (error) {
        console.error("Error creating contact submission:", error);
        return { success: false, error: "Failed to submit message" };
    }
}
