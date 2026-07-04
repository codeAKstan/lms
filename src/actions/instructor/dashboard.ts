"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getInstructorDashboardData(instructorId: string) {
    noStore();
    try {
        // Get all courses once for reuse across queries
        const instructorCourses = await prisma.course.findMany({
            where: { instructorId },
            select: { id: true, category: true }
        });
        const courseIds = instructorCourses.map(c => c.id);

        if (courseIds.length === 0) {
            return {
                success: true,
                data: {
                    stats: {
                        totalRevenue: 0,
                        activeCourses: 0,
                        totalStudents: 0,
                        averageRating: 0,
                        studentGrowthPercent: "0%",
                        instructorTrack: "Clean Tech",
                        averageProgress: 0,
                        revenueGoalProgress: 0,
                        totalReviews: 0
                    },
                    coursePerformanceData: [0, 0, 0, 0, 0],
                    revenueGraph: [],
                    recentCourses: []
                }
            };
        }

        // 1. Instructor Track (most frequent category)
        const categoryCounts = instructorCourses.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const instructorTrack = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Clean Tech";

        // 2. Active Courses Count
        const activeCoursesCount = await prisma.course.count({
            where: { instructorId, published: true }
        });

        // 3. Student Growth Percent
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const current30DaysEnrollments = await prisma.enrollment.count({
            where: { courseId: { in: courseIds }, enrolledAt: { gte: thirtyDaysAgo } }
        });
        const prev30DaysEnrollments = await prisma.enrollment.count({
            where: { courseId: { in: courseIds }, enrolledAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
        });
        const totalEnrollments = await prisma.enrollment.count({
            where: { courseId: { in: courseIds } }
        });

        let studentGrowthPercent = "0%";
        if (prev30DaysEnrollments === 0) {
            studentGrowthPercent = current30DaysEnrollments > 0 ? "+100%" : "0%";
        } else {
            const growth = ((current30DaysEnrollments - prev30DaysEnrollments) / prev30DaysEnrollments) * 100;
            studentGrowthPercent = `${growth >= 0 ? "+" : ""}${Math.round(growth)}%`;
        }

        // 4. Revenue & Goal Progress
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthRevenueAgg = await prisma.payment.aggregate({
            where: { status: "COMPLETED", courseId: { in: courseIds }, createdAt: { gte: startOfCurrentMonth } },
            _sum: { amount: true }
        });
        const currentMonthRevenue = (currentMonthRevenueAgg._sum.amount || 0) / 100;

        const lastMonthRevenueAgg = await prisma.payment.aggregate({
            where: { status: "COMPLETED", courseId: { in: courseIds }, createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth } },
            _sum: { amount: true }
        });
        const lastMonthRevenue = (lastMonthRevenueAgg._sum.amount || 0) / 100;

        let revenueGoalProgress = 0;
        if (lastMonthRevenue === 0) {
            revenueGoalProgress = currentMonthRevenue > 0 ? 100 : 0;
        } else {
            revenueGoalProgress = Math.min(100, Math.round((currentMonthRevenue / lastMonthRevenue) * 100));
        }

        const totalRevenueAgg = await prisma.payment.aggregate({
            where: { status: "COMPLETED", courseId: { in: courseIds } },
            _sum: { amount: true }
        });
        const totalRevenue = (totalRevenueAgg._sum.amount || 0) / 100;

        // 5. Course Performance (Average Progress)
        const allEnrollments = await prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: { progressPercent: true, courseId: true }
        });

        let averageProgress = 0;
        if (allEnrollments.length > 0) {
            const totalProgress = allEnrollments.reduce((sum, e) => sum + e.progressPercent, 0);
            averageProgress = Math.round(totalProgress / allEnrollments.length);
        }

        const latest5Courses = await prisma.course.findMany({
            where: { instructorId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true }
        });
        
        const coursePerformanceData = latest5Courses.map(course => {
            const courseEnrollments = allEnrollments.filter(e => e.courseId === course.id);
            if (courseEnrollments.length === 0) return 0;
            const sum = courseEnrollments.reduce((s, e) => s + e.progressPercent, 0);
            return Math.round(sum / courseEnrollments.length);
        }).reverse(); // oldest to newest of the last 5
        
        while (coursePerformanceData.length < 5) {
            coursePerformanceData.unshift(0);
        }

        // 6. Rating & Reviews
        const ratingAgg = await prisma.review.aggregate({
            where: { courseId: { in: courseIds } },
            _avg: { rating: true },
            _count: { id: true }
        });
        const averageRating = Number((ratingAgg._avg.rating || 0).toFixed(1));
        const totalReviews = ratingAgg._count.id;

        // 7. Revenue Graph over last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const payments = await prisma.payment.findMany({
            where: {
                status: "COMPLETED",
                createdAt: { gte: sixMonthsAgo },
                courseId: { in: courseIds }
            },
            select: { amount: true, createdAt: true }
        });

        const monthlyRevenue = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleDateString("en-US", { month: "short" });
            monthlyRevenue.set(monthStr, 0);
        }

        payments.forEach(p => {
            const monthStr = p.createdAt.toLocaleDateString("en-US", { month: "short" });
            if (monthlyRevenue.has(monthStr)) {
                monthlyRevenue.set(monthStr, monthlyRevenue.get(monthStr)! + (p.amount / 100));
            }
        });

        const revenueGraph = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
            month,
            revenue
        }));

        // 8. Recent Courses
        const recentCourses = await prisma.course.findMany({
            where: { instructorId },
            orderBy: { createdAt: "desc" },
            take: 4,
            include: {
                _count: { select: { enrollments: true } }
            }
        });

        const formattedRecentCourses = recentCourses.map(c => ({
            id: c.id,
            title: c.title,
            students: c._count.enrollments,
            revenue: 0,
            rating: c.rating,
            thumbnail: c.thumbnail,
            published: c.published,
            updatedAt: c.updatedAt
        }));

        return {
            success: true,
            data: {
                stats: {
                    totalRevenue,
                    activeCourses: activeCoursesCount,
                    totalStudents: totalEnrollments,
                    averageRating,
                    studentGrowthPercent,
                    instructorTrack,
                    averageProgress,
                    revenueGoalProgress,
                    totalReviews
                },
                coursePerformanceData,
                revenueGraph,
                recentCourses: formattedRecentCourses
            }
        };

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return { success: false, error: "Failed to fetch dashboard data" };
    }
}
