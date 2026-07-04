"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get all FAQs
export async function getFAQs() {
    noStore();
    try {
        const faqs = await prisma.fAQ.findMany({
            orderBy: { position: "asc" },
        });

        return { success: true, data: faqs };
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return { success: false, error: "Failed to fetch FAQs" };
    }
}

// Get active FAQs only (for public display)
export async function getActiveFAQs(category?: string) {
    try {
        const faqs = await prisma.fAQ.findMany({
            where: {
                active: true,
                ...(category && { category }),
            },
            orderBy: { position: "asc" },
        });

        return { success: true, data: faqs };
    } catch (error) {
        console.error("Error fetching active FAQs:", error);
        return { success: false, error: "Failed to fetch FAQs" };
    }
}

// Get a single FAQ by ID
export async function getFAQ(id: string) {
    try {
        const faq = await prisma.fAQ.findUnique({
            where: { id },
        });

        return { success: true, data: faq };
    } catch (error) {
        console.error(`Error fetching FAQ ${id}:`, error);
        return { success: false, error: "Failed to fetch FAQ" };
    }
}

// Create a new FAQ
export async function createFAQ(data: {
    question: string;
    answer: string;
    category?: string;
    active?: boolean;
}) {
    try {
        // Get the highest position to add at the end
        const maxPosition = await prisma.fAQ.findFirst({
            orderBy: { position: "desc" },
            select: { position: true },
        });

        const newPosition = (maxPosition?.position ?? -1) + 1;

        const faq = await prisma.fAQ.create({
            data: {
                id: `faq-${Date.now()}`,
                question: data.question,
                answer: data.answer,
                category: data.category,
                active: data.active ?? true,
                position: newPosition,
            },
        });

        revalidatePath("/admin/faq");
        revalidatePath("/"); // Revalidate homepage

        return { success: true, data: faq };
    } catch (error) {
        console.error("Error creating FAQ:", error);
        return { success: false, error: "Failed to create FAQ" };
    }
}

// Update an existing FAQ
export async function updateFAQ(id: string, data: {
    question?: string;
    answer?: string;
    category?: string;
    active?: boolean;
}) {
    try {
        const faq = await prisma.fAQ.update({
            where: { id },
            data: {
                ...(data.question !== undefined && { question: data.question }),
                ...(data.answer !== undefined && { answer: data.answer }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.active !== undefined && { active: data.active }),
                updatedAt: new Date(),
            },
        });

        revalidatePath("/admin/faq");
        revalidatePath("/");

        return { success: true, data: faq };
    } catch (error) {
        console.error(`Error updating FAQ ${id}:`, error);
        return { success: false, error: "Failed to update FAQ" };
    }
}

// Delete an FAQ
export async function deleteFAQ(id: string) {
    try {
        await prisma.fAQ.delete({
            where: { id },
        });

        revalidatePath("/admin/faq");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error(`Error deleting FAQ ${id}:`, error);
        return { success: false, error: "Failed to delete FAQ" };
    }
}

// Reorder FAQs
export async function reorderFAQs(faqIds: string[]) {
    try {
        const updates = faqIds.map((id, index) =>
            prisma.fAQ.update({
                where: { id },
                data: { position: index },
            })
        );

        await prisma.$transaction(updates);

        revalidatePath("/admin/faq");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error reordering FAQs:", error);
        return { success: false, error: "Failed to reorder FAQs" };
    }
}

// Initialize default FAQs
export async function initializeDefaultFAQs() {
    const defaultFAQs = [
        {
            question: "What courses do you offer?",
            answer: "We offer a comprehensive range of courses in clean technology, renewable energy, sustainable agriculture, waste management, and climate action. Our curriculum is designed by industry experts to provide practical, hands-on learning experiences.",
            category: "Courses",
        },
        {
            question: "How long does it take to complete a course?",
            answer: "Course duration varies depending on the program. Most courses range from 4 to 12 weeks, with flexible learning schedules to accommodate working professionals. Each course page displays the estimated completion time.",
            category: "Courses",
        },
        {
            question: "Do I receive a certificate upon completion?",
            answer: "Yes! Upon successfully completing a course and passing the final assessment, you'll receive a verified digital certificate that you can share on LinkedIn, add to your resume, or download as a PDF.",
            category: "Certificates",
        },
        {
            question: "What are the payment options?",
            answer: "We accept various payment methods including credit/debit cards, bank transfers, and mobile money through Paystack. We also offer installment payment plans for select courses to make learning more accessible.",
            category: "Payments",
        },
        {
            question: "Can I access courses on mobile devices?",
            answer: "Absolutely! Our platform is fully responsive and works seamlessly on desktop, tablet, and mobile devices. You can learn anytime, anywhere with an internet connection.",
            category: "Technical",
        },
        {
            question: "Is there support available if I have questions?",
            answer: "Yes, we provide comprehensive support through multiple channels: in-course discussion forums, instructor Q&A sessions, email support, and live chat during business hours (Mon-Fri, 9AM-5PM WAT).",
            category: "Support",
        },
    ];

    try {
        const createdFAQs = [];
        for (let i = 0; i < defaultFAQs.length; i++) {
            const faq = await prisma.fAQ.create({
                data: {
                    id: `faq-default-${i + 1}`,
                    question: defaultFAQs[i].question,
                    answer: defaultFAQs[i].answer,
                    category: defaultFAQs[i].category,
                    position: i,
                    active: true,
                },
            });
            createdFAQs.push(faq);
        }

        revalidatePath("/admin/faq");
        revalidatePath("/");

        return { success: true, data: createdFAQs };
    } catch (error) {
        console.error("Error initializing default FAQs:", error);
        return { success: false, error: "Failed to initialize FAQs" };
    }
}
