"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function getAdminDashboardStats() {
    noStore();
    await requireRole('ADMIN');
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, totalCourses, revenueAgg, activeUsersResult, recentPayments, recentUsers, recentCourses,
            usersLast30, usersPrev30, coursesLast30, coursesPrev30, revenueLast30Agg, revenuePrev30Agg
        ] = await Promise.all([
            prisma.user.count(),
            prisma.course.count({ where: { deletedAt: null } }),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { amount: true }
            }),
            // Active users = users with at least one enrollment
            prisma.enrollment.groupBy({
                by: ["userId"],
                _count: { userId: true }
            }).then(rows => rows.length),
            // Recent 5 completed payments for activity feed
            prisma.payment.findMany({
                where: { status: "COMPLETED" },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    user: { select: { name: true, email: true } }
                }
            }),
            // Recent 5 new users for activity feed
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    role: true
                }
            }),
            // Recent 3 courses for Content Pipeline preview
            prisma.course.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 3,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    studentCount: true,
                    instructor: { select: { name: true } }
                }
            }),
            // Trends data
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.course.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
            prisma.course.count({ where: { deletedAt: null, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
            prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } })
        ]);

        const totalRevenue = (revenueAgg._sum.amount ?? 0) / 100;
        const revenueLast30 = (revenueLast30Agg._sum.amount ?? 0) / 100;
        const revenuePrev30 = (revenuePrev30Agg._sum.amount ?? 0) / 100;

        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const trends = {
            users: calculateTrend(usersLast30, usersPrev30),
            courses: calculateTrend(coursesLast30, coursesPrev30),
            revenue: calculateTrend(revenueLast30, revenuePrev30),
            usersLast30,
            coursesLast30,
        };

        // Merge and sort activity feed by date
        const activityFeed = [
            ...recentPayments.map(p => ({
                id: `pay-${p.id}`,
                type: "payment" as const,
                action: "Payment received",
                details: `₦${(p.amount / 100).toLocaleString()} — ${p.user.name || p.user.email}`,
                time: p.createdAt,
                status: "completed" as const
            })),
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: "user" as const,
                action: "New user registered",
                details: u.email,
                time: u.createdAt,
                status: "completed" as const
            }))
        ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 8);

        // Monthly revenue for chart (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const monthlyPayments = await prisma.payment.findMany({
            where: {
                status: "COMPLETED",
                createdAt: { gte: sixMonthsAgo }
            },
            select: { amount: true, createdAt: true }
        });

        const monthlyMap = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString("en-US", { month: "short" });
            monthlyMap.set(key, 0);
        }
        monthlyPayments.forEach(p => {
            const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short" });
            if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + p.amount / 100);
        });
        const revenueChart = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

        // Weekly revenue for chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyPayments = await prisma.payment.findMany({
            where: {
                status: "COMPLETED",
                createdAt: { gte: sevenDaysAgo }
            },
            select: { amount: true, createdAt: true }
        });

        const weeklyMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString("en-US", { weekday: "short" });
            weeklyMap.set(key, 0);
        }
        weeklyPayments.forEach(p => {
            const key = new Date(p.createdAt).toLocaleDateString("en-US", { weekday: "short" });
            if (weeklyMap.has(key)) {
                weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + p.amount / 100);
            }
        });
        const weeklyChart = Array.from(weeklyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

        return {
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalRevenue,
                activeUsers: activeUsersResult,
                activityFeed,
                revenueChart,
                weeklyChart,
                trends,
                recentCourses: recentCourses.map(c => ({
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                    instructor: c.instructor?.name ?? "Unknown",
                    status: c.published ? "published" : "draft",
                    enrollment: c.studentCount ?? 0
                }))
            }
        };
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return { success: false, error: "Failed to load dashboard" };
    }
}

export async function getAdminAnalytics() {
    noStore();
    await requireRole('ADMIN');
    try {
        const [totalUsers, totalEnrollments, revenueAgg, topCourses] = await Promise.all([
            prisma.user.count(),
            prisma.enrollment.count(),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { amount: true }
            }),
            // Top 5 courses by enrollment
            prisma.course.findMany({
                where: { published: true },
                orderBy: { studentCount: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    _count: { select: { enrollments: true } }
                }
            })
        ]);

        const totalRevenue = (revenueAgg._sum.amount ?? 0) / 100;

        // Monthly revenue for chart (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        const payments = await prisma.payment.findMany({
            where: { status: "COMPLETED", createdAt: { gte: twelveMonthsAgo } },
            select: { amount: true, createdAt: true }
        });

        const monthlyMap = new Map<string, number>();
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString("en-US", { month: "short" });
            monthlyMap.set(key, 0);
        }
        payments.forEach(p => {
            const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short" });
            if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + p.amount / 100);
        });

        const revenueChart = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

        return {
            success: true,
            data: {
                totalUsers,
                totalEnrollments,
                totalRevenue,
                topCourses: topCourses.map((c, i) => ({
                    rank: i + 1,
                    name: c.title,
                    enrollments: c._count.enrollments
                })),
                revenueChart
            }
        };
    } catch (error) {
        console.error("Admin analytics error:", error);
        return { success: false, error: "Failed to load analytics" };
    }
}
