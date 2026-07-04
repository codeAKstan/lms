"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getInstructorAnalytics(instructorId: string) {
    noStore();
    try {
        // 1. Get all course IDs for this instructor (used in multiple queries below)
        const instructorCourses = await prisma.course.findMany({
            where: { instructorId },
            select: { id: true }
        });
        const courseIds = instructorCourses.map(c => c.id);

        // 2. Basic Stats
        const activeCoursesCount = await prisma.course.count({
            where: { instructorId, published: true }
        });

        const totalStudents = await prisma.enrollment.count({
            where: { courseId: { in: courseIds } }
        });

        const revenueAgg = await prisma.payment.aggregate({
            where: {
                status: "COMPLETED",
                courseId: { in: courseIds }
            },
            _sum: { amount: true }
        });
        const totalRevenue = (revenueAgg._sum.amount || 0) / 100;

        const ratingAgg = await prisma.review.aggregate({
            where: { courseId: { in: courseIds } },
            _avg: { rating: true }
        });
        const averageRating = Number((ratingAgg._avg.rating || 0).toFixed(1));

        // 3. Course Performance Table
        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                _count: { select: { enrollments: true } }
            }
        });

        // Fetch payments separately (Course has no payments relation)
        const coursePayments = await prisma.payment.findMany({
            where: {
                status: "COMPLETED",
                courseId: { in: courseIds }
            },
            select: { courseId: true, amount: true }
        });

        // Build a revenue map: courseId -> total revenue
        const revenueMap = new Map<string, number>();
        coursePayments.forEach(p => {
            revenueMap.set(p.courseId, (revenueMap.get(p.courseId) ?? 0) + p.amount);
        });

        const coursePerformance = courses.map(c => ({
            id: c.id,
            name: c.title,
            sales: c._count.enrollments,
            rating: c.rating,
            revenue: (revenueMap.get(c.id) ?? 0) / 100
        }));

        coursePerformance.sort((a, b) => b.revenue - a.revenue);

        return {
            success: true,
            data: {
                totalRevenue,
                totalStudents,
                activeCourses: activeCoursesCount,
                averageRating,
                coursePerformance
            }
        };

    } catch (error) {
        console.error("Analytics fetch error:", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}
