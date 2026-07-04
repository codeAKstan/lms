"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all testimonials
export async function getTestimonials() {
    noStore();
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { position: "asc" },
        });

        return { success: true, data: testimonials };
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return { success: false, error: "Failed to fetch testimonials" };
    }
}

// Get a single testimonial
export async function getTestimonial(id: string) {
    try {
        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        return { success: true, data: testimonial };
    } catch (error) {
        console.error(`Error fetching testimonial ${id}:`, error);
        return { success: false, error: "Failed to fetch testimonial" };
    }
}

// Create a new testimonial
export async function createTestimonial(data: {
    name: string;
    role: string;
    company?: string;
    content: string;
    avatar?: string;
    rating?: number;
}) {
    try {
        const maxPosition = await prisma.testimonial.aggregate({
            _max: { position: true },
        });

        const testimonial = await prisma.testimonial.create({
            data: {
                id: `testimonial-${Date.now()}`,
                ...data,
                position: (maxPosition._max.position || 0) + 1,
            },
        });

        revalidatePath("/admin/testimonials");
        revalidatePath("/", "layout");

        return { success: true, data: testimonial };
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return { success: false, error: "Failed to create testimonial" };
    }
}

// Update a testimonial
export async function updateTestimonial(
    id: string,
    data: {
        name?: string;
        role?: string;
        company?: string;
        content?: string;
        avatar?: string;
        rating?: number;
        featured?: boolean;
        active?: boolean;
    }
) {
    try {
        const testimonial = await prisma.testimonial.update({
            where: { id },
            data,
        });

        revalidatePath("/admin/testimonials");
        revalidatePath("/", "layout");

        return { success: true, data: testimonial };
    } catch (error) {
        console.error(`Error updating testimonial ${id}:`, error);
        return { success: false, error: "Failed to update testimonial" };
    }
}

// Delete a testimonial
export async function deleteTestimonial(id: string) {
    try {
        await prisma.testimonial.delete({
            where: { id },
        });

        revalidatePath("/admin/testimonials");

        return { success: true };
    } catch (error) {
        console.error(`Error deleting testimonial ${id}:`, error);
        return { success: false, error: "Failed to delete testimonial" };
    }
}

// Initialize default testimonials
export async function initializeDefaultTestimonials() {
    const defaultTestimonials = [
        {
            name: "Dr. Sarah Johnson",
            role: "Environmental Scientist",
            company: "GreenTech Solutions",
            content: "The courses offered by Clean Technology Hub have been transformative for our team. The practical approach to renewable energy solutions has helped us implement sustainable practices across our organization.",
            rating: 5,
            featured: true,
        },
        {
            name: "Michael Chen",
            role: "Sustainability Manager",
            company: "EcoInnovate Ltd",
            content: "Outstanding training programs! The instructors are knowledgeable and passionate about clean technology. I've gained invaluable insights that I'm already applying in my work.",
            rating: 5,
            featured: true,
        },
        {
            name: "Amina Bello",
            role: "Renewable Energy Consultant",
            company: "PowerGreen Nigeria",
            content: "Clean Technology Hub is leading the way in climate tech education in Nigeria. The networking opportunities and practical workshops have been incredibly beneficial for my career growth.",
            rating: 5,
            featured: false,
        },
    ];

    try {
        const testimonials = defaultTestimonials.map((testimonial, index) => ({
            id: `testimonial-default-${index + 1}`,
            ...testimonial,
            position: index,
            active: true,
        }));

        await prisma.testimonial.createMany({
            data: testimonials,
            skipDuplicates: true,
        });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error initializing default testimonials:", error);
        return { success: false, error: "Failed to initialize testimonials" };
    }
}
