"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

type PaymentFilters = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
};

export async function getAdminPayments({ page = 1, limit = 20, search = "", status = "all" }: PaymentFilters) {
    noStore();
    try {
        const skip = (page - 1) * limit;

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (status !== "all") where.status = status;

        // All payments with user info
        const allPayments = await prisma.payment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        // Get course titles separately (Payment has no course relation)
        const courseIds = [...new Set(allPayments.map(p => p.courseId))];
        const courses = await prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: { id: true, title: true }
        });
        const courseMap = new Map(courses.map(c => [c.id, c.title]));

        // Apply search filter in JS (search across student name, email, course title)
        const filtered = search
            ? allPayments.filter(p => {
                const q = search.toLowerCase();
                return (
                    p.user.name?.toLowerCase().includes(q) ||
                    p.user.email?.toLowerCase().includes(q) ||
                    courseMap.get(p.courseId)?.toLowerCase().includes(q)
                );
            })
            : allPayments;

        const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
        const paginated = filtered.slice(skip, skip + limit);

        const payments = paginated.map(p => ({
            id: p.id,
            studentName: p.user.name || "Unknown",
            studentEmail: p.user.email,
            courseTitle: courseMap.get(p.courseId) ?? "Unknown Course",
            amount: p.amount,
            currency: p.currency,
            gateway: p.gateway,
            status: p.status,
            gatewayReference: p.gatewayReference,
            createdAt: p.createdAt
        }));

        // Stats (always from all completed, not filtered)
        const completedAll = allPayments.filter(p => p.status === "COMPLETED");
        const totalRevenue = completedAll.reduce((s, p) => s + p.amount, 0) / 100;
        const paystackRevenue = completedAll.filter(p => p.gateway?.toLowerCase() === "paystack").reduce((s, p) => s + p.amount, 0) / 100;

        return {
            success: true,
            data: {
                payments,
                totalPages,
                stats: {
                    totalRevenue,
                    paystackRevenue,
                    totalTransactions: allPayments.length,
                    completedCount: completedAll.length
                }
            }
        };
    } catch (error) {
        console.error("Admin payments error:", error);
        return { success: false, error: "Failed to load payments" };
    }
}
