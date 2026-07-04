"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all site settings
export async function getSettings() {
    noStore();
    try {
        const settings = await prisma.siteSettings.findMany({
            orderBy: { key: "asc" },
        });

        // Convert to key-value object for easier access
        const settingsObject: Record<string, { value: string; type: string; description?: string }> = {};
        settings.forEach(setting => {
            settingsObject[setting.key] = {
                value: setting.value,
                type: setting.type,
                description: setting.description || undefined,
            };
        });

        return { success: true, data: settingsObject };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { success: false, error: "Failed to fetch settings" };
    }
}

// Get a single setting by key
export async function getSetting(key: string) {
    noStore();
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key },
        });

        return { success: true, data: setting };
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return { success: false, error: "Failed to fetch setting" };
    }
}

// Update a single setting
export async function updateSetting(key: string, value: string, description?: string) {
    try {
        const setting = await prisma.siteSettings.upsert({
            where: { key },
            update: {
                value,
                description,
                updatedAt: new Date(),
            },
            create: {
                id: `setting-${Date.now()}`,
                key,
                value,
                description,
                type: "text",
            },
        });

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout"); // Revalidate all public pages

        return { success: true, data: setting };
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { success: false, error: "Failed to update setting" };
    }
}

// Bulk update settings
export async function bulkUpdateSettings(settings: Array<{ key: string; value: string; description?: string }>) {
    try {
        const updates = settings.map(setting =>
            prisma.siteSettings.upsert({
                where: { key: setting.key },
                update: {
                    value: setting.value,
                    description: setting.description,
                    updatedAt: new Date(),
                },
                create: {
                    id: `setting-${setting.key}-${Date.now()}`,
                    key: setting.key,
                    value: setting.value,
                    description: setting.description,
                    type: "text",
                },
            })
        );

        await prisma.$transaction(updates);

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error) {
        console.error("Error bulk updating settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

// Delete a setting
export async function deleteSetting(key: string) {
    try {
        await prisma.siteSettings.delete({
            where: { key },
        });

        revalidatePath("/admin/settings");

        return { success: true };
    } catch (error) {
        console.error(`Error deleting setting ${key}:`, error);
        return { success: false, error: "Failed to delete setting" };
    }
}

// Initialize default settings (run once during setup)
export async function initializeDefaultSettings() {
    const defaultSettings = [
        { key: "contact_email", value: "info@cleantechnologyhub.org", description: "Contact email address" },
        { key: "contact_phone", value: "+234 809 602 4444", description: "Contact phone number" },
        { key: "contact_address", value: "1, Sarki Tafida St. Guzape, Abuja FCT, Nigeria", description: "Physical address" },
        { key: "office_hours", value: "Mon - Fri: 9AM - 5PM WAT", description: "Office hours" },
        { key: "google_maps_embed", value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.869407!2d7.497!3d9.073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDQnMjIuOCJOIDfCsDI5JzQ5LjIiRQ!5e0!3m2!1sen!2sng!4v1234567890", description: "Google Maps embed URL" },
        { key: "facebook_url", value: "", description: "Facebook page URL" },
        { key: "twitter_url", value: "", description: "Twitter/X profile URL" },
        { key: "linkedin_url", value: "", description: "LinkedIn page URL" },
        { key: "instagram_url", value: "", description: "Instagram profile URL" },
    ];

    try {
        const result = await bulkUpdateSettings(defaultSettings);
        if (!result.success) {
            console.error("Error initializing default settings:", result.error);
            return { success: false, error: result.error || "Failed to initialize settings" };
        }
        return { success: true };
    } catch (error) {
        console.error("Error initializing default settings:", error);
        return { success: false, error: "Failed to initialize settings" };
    }
}
