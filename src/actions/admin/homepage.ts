"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// HERO SECTION
// ============================================

export async function getHero() {
    noStore();
    try {
        const hero = await prisma.homepageHero.findFirst({
            where: { active: true },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: hero };
    } catch (error) {
        console.error("Error fetching hero:", error);
        return { success: false, error: "Failed to fetch hero section" };
    }
}

export async function updateHero(data: {
    title: string;
    subtitle: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    backgroundImage?: string;
}) {
    try {
        // Deactivate all existing heroes
        await prisma.homepageHero.updateMany({
            data: { active: false },
        });

        // Create new active hero
        const hero = await prisma.homepageHero.create({
            data: {
                id: `hero-${Date.now()}`,
                ...data,
                active: true,
            },
        });

        revalidatePath("/");

        return { success: true, data: hero };
    } catch (error) {
        console.error("Error updating hero:", error);
        return { success: false, error: "Failed to update hero section" };
    }
}

export async function initializeDefaultHero() {
    try {
        const hero = await prisma.homepageHero.create({
            data: {
                id: `hero-default`,
                title: "Learn without limits",
                subtitle: "Professional Education",
                description: "Build skills with courses, certificates, and professional degrees online from world-class instructors and clean tech companies.",
                primaryBtnText: "Join for Free",
                primaryBtnLink: "/register",
                secondaryBtnText: "Try CTH EdTech for Business",
                secondaryBtnLink: "/business",
                backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop",
                active: true,
            },
        });

        revalidatePath("/");

        return { success: true, data: hero };
    } catch (error) {
        console.error("Error initializing hero:", error);
        return { success: false, error: "Failed to initialize hero" };
    }
}

// ============================================
// FOCUS AREAS
// ============================================

export async function getFocusAreas() {
    noStore();
    try {
        const areas = await prisma.focusArea.findMany({
            orderBy: { position: "asc" },
        });

        return { success: true, data: areas };
    } catch (error) {
        console.error("Error fetching focus areas:", error);
        return { success: false, error: "Failed to fetch focus areas" };
    }
}

export async function getActiveFocusAreas() {
    noStore();
    try {
        const areas = await prisma.focusArea.findMany({
            where: { active: true },
            orderBy: { position: "asc" },
        });

        return { success: true, data: areas };
    } catch (error) {
        console.error("Error fetching active focus areas:", error);
        return { success: false, error: "Failed to fetch focus areas" };
    }
}

export async function createFocusArea(data: {
    title: string;
    description: string;
    icon: string;
    color?: string;
}) {
    try {
        const maxPosition = await prisma.focusArea.findFirst({
            orderBy: { position: "desc" },
            select: { position: true },
        });

        const area = await prisma.focusArea.create({
            data: {
                id: `focus-${Date.now()}`,
                title: data.title,
                description: data.description,
                icon: data.icon,
                color: data.color || "primary",
                position: (maxPosition?.position ?? -1) + 1,
                active: true,
            },
        });

        revalidatePath("/");

        return { success: true, data: area };
    } catch (error) {
        console.error("Error creating focus area:", error);
        return { success: false, error: "Failed to create focus area" };
    }
}

export async function updateFocusArea(id: string, data: {
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
    active?: boolean;
}) {
    try {
        const area = await prisma.focusArea.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.active !== undefined && { active: data.active }),
                updatedAt: new Date(),
            },
        });

        revalidatePath("/");

        return { success: true, data: area };
    } catch (error) {
        console.error("Error updating focus area:", error);
        return { success: false, error: "Failed to update focus area" };
    }
}

export async function deleteFocusArea(id: string) {
    try {
        await prisma.focusArea.delete({
            where: { id },
        });

        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error deleting focus area:", error);
        return { success: false, error: "Failed to delete focus area" };
    }
}

export async function initializeDefaultFocusAreas() {
    const defaultAreas = [
        {
            title: "Learn the latest skills",
            description: "Like renewable energy engineering, sustainability operations, and climate finance.",
            icon: "GraduationCap",
            color: "primary",
        },
        {
            title: "Get ready for a career",
            description: "In high-demand fields like solar installation, green business consulting, and ESG.",
            icon: "Briefcase",
            color: "secondary",
        },
        {
            title: "Earn a certificate",
            description: "Or degree from a leading university in clean technology and sustainability.",
            icon: "Trophy",
            color: "success",
        },
        {
            title: "Upskill your organization",
            description: "With on-demand training and development programs designed for green enterprises.",
            icon: "CheckCircle2",
            color: "cth-blue",
        },
    ];

    try {
        const areas = [];
        for (let i = 0; i < defaultAreas.length; i++) {
            const area = await prisma.focusArea.create({
                data: {
                    id: `focus-default-${i + 1}`,
                    ...defaultAreas[i],
                    position: i,
                    active: true,
                },
            });
            areas.push(area);
        }

        revalidatePath("/");

        return { success: true, data: areas };
    } catch (error) {
        console.error("Error initializing focus areas:", error);
        return { success: false, error: "Failed to initialize focus areas" };
    }
}

// ============================================
// PROGRAMS
// ============================================

export async function getPrograms() {
    noStore();
    try {
        const programs = await prisma.program.findMany({
            orderBy: { position: "asc" },
        });

        return { success: true, data: programs };
    } catch (error) {
        console.error("Error fetching programs:", error);
        return { success: false, error: "Failed to fetch programs" };
    }
}

export async function getActivePrograms() {
    noStore();
    try {
        const programs = await prisma.program.findMany({
            where: { active: true },
            orderBy: { position: "asc" },
        });

        return { success: true, data: programs };
    } catch (error) {
        console.error("Error fetching active programs:", error);
        return { success: false, error: "Failed to fetch programs" };
    }
}

export async function createProgram(data: {
    title: string;
    description: string;
    badge: string;
    badgeColor?: string;
}) {
    try {
        const maxPosition = await prisma.program.findFirst({
            orderBy: { position: "desc" },
            select: { position: true },
        });

        const program = await prisma.program.create({
            data: {
                id: `program-${Date.now()}`,
                title: data.title,
                description: data.description,
                badge: data.badge,
                badgeColor: data.badgeColor || "bg-primary",
                position: (maxPosition?.position ?? -1) + 1,
                active: true,
            },
        });

        revalidatePath("/");

        return { success: true, data: program };
    } catch (error) {
        console.error("Error creating program:", error);
        return { success: false, error: "Failed to create program" };
    }
}

export async function updateProgram(id: string, data: {
    title?: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    active?: boolean;
}) {
    try {
        const program = await prisma.program.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.badge !== undefined && { badge: data.badge }),
                ...(data.badgeColor !== undefined && { badgeColor: data.badgeColor }),
                ...(data.active !== undefined && { active: data.active }),
                updatedAt: new Date(),
            },
        });

        revalidatePath("/");

        return { success: true, data: program };
    } catch (error) {
        console.error("Error updating program:", error);
        return { success: false, error: "Failed to update program" };
    }
}

export async function deleteProgram(id: string) {
    try {
        await prisma.program.delete({
            where: { id },
        });

        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error deleting program:", error);
        return { success: false, error: "Failed to delete program" };
    }
}

export async function initializeDefaultPrograms() {
    const defaultPrograms = [
        {
            title: "Professional Courses",
            description: "Industry-recognized certifications in renewable energy, sustainable agriculture, and climate technology. Designed for career advancement.",
            badge: "Career Ready",
            badgeColor: "bg-primary",
        },
        {
            title: "Short Workshops",
            description: "Focused 2-4 week programs on specific topics like solar installation, waste management, or carbon accounting. Perfect for skill upgrades.",
            badge: "Quick Wins",
            badgeColor: "bg-secondary",
        },
        {
            title: "Corporate Training",
            description: "Customized sustainability training for teams. Help your organization meet ESG goals and build climate-conscious practices.",
            badge: "For Teams",
            badgeColor: "bg-success",
        },
    ];

    try {
        const programs = [];
        for (let i = 0; i < defaultPrograms.length; i++) {
            const program = await prisma.program.create({
                data: {
                    id: `program-default-${i + 1}`,
                    ...defaultPrograms[i],
                    position: i,
                    active: true,
                },
            });
            programs.push(program);
        }

        revalidatePath("/");

        return { success: true, data: programs };
    } catch (error) {
        console.error("Error initializing programs:", error);
        return { success: false, error: "Failed to initialize programs" };
    }
}
