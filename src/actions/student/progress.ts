"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getStudentProgressData(userId: string) {
    noStore();
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        // Fetch all active enrollments for this user
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                course: { deletedAt: null }
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        modules: {
                            select: {
                                lessons: {
                                    select: { id: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // If no enrollments, return early zeroes
        if (enrollments.length === 0) {
            return {
                success: true,
                data: {
                    totalTimeSpentHours: 0,
                    coursesCompletedCount: 0,
                    averageCompletionPercent: 0,
                    coursesWithProgress: [],
                    currentStreakDays: 0
                }
            };
        }

        // Fetch all of the user's LessonProgress entries globally
        const allProgress = await prisma.lessonProgress.findMany({
            where: { userId }
        });

        // Fetch all of the user's passed QuizAttempts
        const passedQuizzes = await prisma.quizAttempt.findMany({
            where: { userId, passed: true },
            select: { quizId: true, quiz: { select: { lesson: { select: { module: { select: { courseId: true } } } } } } }
        });

        // 1. Calculate Grand Total Time Spent globally (seconds -> hours)
        const totalTimeSpentSeconds = allProgress.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
        const totalTimeSpentHours = Math.round(totalTimeSpentSeconds / 3600);

        // Map over enrollments to build the Course-by-Course Grid
        const coursesWithProgress = enrollments.map((enr) => {
            const course = enr.course;

            // Flatten all lessons in this specific course
            const courseLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
            const totalLessons = courseLessonIds.length;

            // Filter the global progress down to just this course's lessons
            const thisCourseProgress = allProgress.filter(p => courseLessonIds.includes(p.lessonId));

            // Count how many are strictly completed
            const completedLessons = thisCourseProgress.filter(p => p.completed).length;

            // Calculate percentage
            const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

            // Time spent on this specific course (seconds -> hours)
            const courseTimeSeconds = thisCourseProgress.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
            const courseTimeHours = Math.round(courseTimeSeconds / 3600);

            // Count passed quizzes for this course
            const quizzesPassed = passedQuizzes.filter(q => q.quiz.lesson.module.courseId === course.id).length;

            return {
                id: course.id,
                title: course.title,
                progress,
                timeSpent: courseTimeHours,
                quizzesPassed,
                totalQuizzes: 0, // Keeping totalQuizzes 0 as per existing comment until full mapping
                isGloballyComplete: !!enr.completedAt || progress === 100
            };
        });

        // 2. Count courses fully completed (100% or explicitly marked complete)
        const coursesCompletedCount = coursesWithProgress.filter(c => c.isGloballyComplete).length;

        // 3. Average completion across active enrollments
        const sumOfPercentages = coursesWithProgress.reduce((acc, curr) => acc + curr.progress, 0);
        const averageCompletionPercent = Math.round(sumOfPercentages / coursesWithProgress.length);

        // 4. Calculate current learning streak (consecutive days with activity)
        const uniqueActivityDays = new Set(
            allProgress
                .filter(p => p.completedAt)
                .map(p => new Date(p.completedAt!).toISOString().slice(0, 10))
        );
        const sortedDays = Array.from(uniqueActivityDays).sort().reverse();
        let currentStreakDays = 0;
        if (sortedDays.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            if (sortedDays[0] === today || sortedDays[0] === yesterday) {
                currentStreakDays = 1;
                for (let i = 1; i < sortedDays.length; i++) {
                    const prev = new Date(sortedDays[i - 1]);
                    const curr = new Date(sortedDays[i]);
                    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
                    if (diffDays === 1) {
                        currentStreakDays++;
                    } else {
                        break;
                    }
                }
            }
        }

        return {
            success: true,
            data: {
                totalTimeSpentHours,
                coursesCompletedCount,
                averageCompletionPercent,
                coursesWithProgress,
                currentStreakDays
            }
        };

    } catch (error) {
        console.error("Error fetching progress data:", error);
        return { success: false, error: "Failed to load progress data" };
    }
}
