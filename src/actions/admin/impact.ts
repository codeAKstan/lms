"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all impact metrics
export async function getImpactMetrics() {
    noStore();
    try {
        const metrics = await prisma.impactMetric.findMany({
            where: { active: true },
            orderBy: { position: "asc" },
        });

        return { success: true, data: metrics };
    } catch (error) {
        console.error("Error fetching impact metrics:", error);
        return { success: false, error: "Failed to fetch metrics" };
    }
}

// Create an impact metric
export async function createImpactMetric(data: {
    label: string;
    value: string;
}) {
    try {
        const maxPosition = await prisma.impactMetric.aggregate({
            _max: { position: true },
        });

        const metric = await prisma.impactMetric.create({
            data: {
                id: `impact-${Date.now()}`,
                ...data,
                position: (maxPosition._max.position || 0) + 1,
            },
        });

        revalidatePath("/admin/about");
        revalidatePath("/about");

        return { success: true, data: metric };
    } catch (error) {
        console.error("Error creating impact metric:", error);
        return { success: false, error: "Failed to create metric" };
    }
}

// Update an impact metric
export async function updateImpactMetric(
    id: string,
    data: {
        label?: string;
        value?: string;
        active?: boolean;
    }
) {
    try {
        const metric = await prisma.impactMetric.update({
            where: { id },
            data,
        });

        revalidatePath("/admin/about");
        revalidatePath("/about");

        return { success: true, data: metric };
    } catch (error) {
        console.error(`Error updating impact metric ${id}:`, error);
        return { success: false, error: "Failed to update metric" };
    }
}

// Delete an impact metric
export async function deleteImpactMetric(id: string) {
    try {
        await prisma.impactMetric.delete({
            where: { id },
        });

        revalidatePath("/admin/about");

        return { success: true };
    } catch (error) {
        console.error(`Error deleting impact metric ${id}:`, error);
        return { success: false, error: "Failed to delete metric" };
    }
}

// Initialize default metrics
export async function initializeDefaultMetrics() {
    const defaultMetrics = [
        { label: "Students Trained", value: "5000+" },
        { label: "Courses Offered", value: "50+" },
        { label: "Industry Partners", value: "30+" },
        { label: "Success Rate", value: "95%" },
    ];

    try {
        const metrics = defaultMetrics.map((metric, index) => ({
            id: `impact-default-${index + 1}`,
            ...metric,
            position: index,
            active: true,
        }));

        await prisma.impactMetric.createMany({
            data: metrics,
            skipDuplicates: true,
        });

        revalidatePath("/admin/about");
        return { success: true };
    } catch (error) {
        console.error("Error initializing default metrics:", error);
        return { success: false, error: "Failed to initialize metrics" };
    }
}
