"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getInstructorEarnings(instructorId: string) {
    noStore();
    try {
        // Get all instructor course IDs
        const instructorCourses = await prisma.course.findMany({
            where: { instructorId },
            select: { id: true, title: true }
        });
        const courseIds = instructorCourses.map(c => c.id);
        const courseTitleMap = new Map(instructorCourses.map(c => [c.id, c.title]));

        // All completed payments
        const payments = await prisma.payment.findMany({
            where: {
                courseId: { in: courseIds },
                status: "COMPLETED"
            },
            select: {
                id: true,
                amount: true,
                currency: true,
                courseId: true,
                userId: true,
                createdAt: true,
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Total lifetime revenue
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0) / 100;

        // This month's revenue
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthRevenue = payments
            .filter(p => new Date(p.createdAt) >= startOfMonth)
            .reduce((sum, p) => sum + p.amount, 0) / 100;

        // Last month's revenue
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthRevenue = payments
            .filter(p => {
                const d = new Date(p.createdAt);
                return d >= startOfLastMonth && d < startOfMonth;
            })
            .reduce((sum, p) => sum + p.amount, 0) / 100;

        // Monthly breakdown for chart (last 6 months)
        const monthlyMap = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            monthlyMap.set(key, 0);
        }
        payments.forEach(p => {
            const d = new Date(p.createdAt);
            const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            if (monthlyMap.has(key)) {
                monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + p.amount / 100);
            }
        });

        const monthlyChart = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
            month,
            revenue
        }));

        // Format individual transactions
        const transactions = payments.slice(0, 50).map(p => ({
            id: p.id,
            studentName: p.user.name || "Unknown",
            studentEmail: p.user.email,
            courseName: courseTitleMap.get(p.courseId) ?? "Unknown Course",
            amount: p.amount / 100,
            currency: p.currency,
            date: p.createdAt
        }));

        return {
            success: true,
            data: {
                totalRevenue,
                thisMonthRevenue,
                lastMonthRevenue,
                transactionCount: payments.length,
                monthlyChart,
                transactions
            }
        };

    } catch (error) {
        console.error("Earnings fetch error:", error);
        return { success: false, error: "Failed to fetch earnings" };
    }
}
