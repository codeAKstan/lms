"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getStudentDashboardData(userId: string) {
    noStore();
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        // 1. Fetch Enrollments with Course Details
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: userId,
                course: { deletedAt: null }
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnail: true,
                        category: true,
                        totalHours: true,
                        lectures: true,
                        instructor: { select: { name: true } },
                        modules: {
                            orderBy: { position: 'asc' },
                            include: {
                                lessons: {
                                    orderBy: { position: 'asc' },
                                    select: { id: true, title: true, position: true, moduleId: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { lastAccessedAt: 'desc' }
        });

        const validEnrollments = enrollments.filter(e => e.course !== null);
        const courseIds = validEnrollments.map(e => e.courseId);

        // 2. Fetch all lesson progress for this user to calculate hours learned and next lesson
        const lessonProgress = await prisma.lessonProgress.findMany({
            where: { userId: userId }
        });

        // 3. Calculate Hours Learned (sum of timeSpent in seconds, converted to hours)
        const totalSecondsLearned = lessonProgress.reduce((acc, curr) => acc + curr.timeSpent, 0);
        const hoursLearned = Math.round(totalSecondsLearned / 3600);

        // 4. Fetch Certificates
        const certificatesCount = await prisma.certificate.count({
            where: { userId: userId }
        });

        // 5. Calculate Stats
        const totalEnrolled = validEnrollments.length;
        const completedCourses = validEnrollments.filter(e => e.completedAt !== null).length;
        const totalProgress = validEnrollments.reduce((acc, curr) => acc + curr.progressPercent, 0);
        const avgCompletionRate = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

        // 6. Map Courses with "Next Lesson" logic
        const courses = validEnrollments.map(e => {
            const course = e.course!;
            let nextLessonTitle = "Start Learning";

            if (e.progressPercent === 100) {
                nextLessonTitle = "Completed";
            } else {
                // Find the first chronological lesson that is NOT completed
                let foundNext = false;
                for (const courseModule of course.modules) {
                    for (const lesson of courseModule.lessons) {
                        const progress = lessonProgress.find(p => p.lessonId === lesson.id);
                        if (!progress || !progress.completed) {
                            nextLessonTitle = lesson.title;
                            foundNext = true;
                            break;
                        }
                    }
                    if (foundNext) break;
                }
            }

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                thumbnail: course.thumbnail,
                category: course.category,
                progress: e.progressPercent,
                lastAccessed: e.lastAccessedAt,
                instructor: course.instructor.name,
                nextLesson: nextLessonTitle
            };
        });

        // 7. Fetch Upcoming Live Sessions for the enrolled courses
        const upcomingLiveSessions = courseIds.length > 0
            ? await prisma.liveSession.findMany({
                where: {
                    courseId: { in: courseIds },
                    date: { gte: new Date() } // Only future dates
                },
                take: 3,
                orderBy: { date: 'asc' },
                include: { course: { select: { instructor: { select: { name: true } } } } }
            })
            : [];

        // 8. Fetch or Create Weekly Goal
        let studentGoal = await prisma.studentGoal.findUnique({
            where: { userId }
        });

        if (!studentGoal) {
            studentGoal = await prisma.studentGoal.create({
                data: { userId, targetHours: 5 }
            });
        }

        // 9. Fetch student name
        const studentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        return {
            studentName: studentUser?.name || null,
            stats: {
                enrolled: totalEnrolled,
                completed: completedCourses,
                hoursLearned: hoursLearned,
                certificates: certificatesCount,
                avgCompletion: avgCompletionRate
            },
            courses,
            liveSessions: upcomingLiveSessions.map((session: { id: string; title: string; date: Date; course: { instructor: { name: string } } }) => ({
                id: session.id,
                title: session.title,
                date: session.date.toISOString(),
                instructor: session.course.instructor.name
            })),
            goal: {
                targetHours: studentGoal.targetHours,
                currentHours: hoursLearned // For now using total hours learned. To be strictly weekly, you'd filter `timeSpent` delta within the week.
            }
        };
    } catch (error) {
        console.error("Error fetching student dashboard data:", error);
        throw new Error("Failed to load dashboard data");
    }
}
