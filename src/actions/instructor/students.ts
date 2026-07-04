"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getInstructorStudents(instructorId: string) {
    noStore();
    try {
        // Fetch all enrollments for courses owned by this instructor, with related user and course
        const enrollments = await prisma.enrollment.findMany({
            where: {
                course: { instructorId }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                enrolledAt: 'desc'
            }
        });

        // Get all course IDs these students are enrolled in
        const courseIds = [...new Set(enrollments.map(e => e.courseId))];

        // Per-course count of lessons for progress calculation
        const courseLessonCounts = await Promise.all(
            courseIds.map(async (courseId) => {
                const count = await prisma.lesson.count({
                    where: { module: { courseId } }
                });
                return { courseId, count };
            })
        );

        const lessonCountMap = new Map(courseLessonCounts.map(x => [x.courseId, x.count]));

        // Get distinct courses for dropdown filter
        const courseMap = new Map<string, string>();
        enrollments.forEach(e => {
            if (!courseMap.has(e.courseId)) {
                courseMap.set(e.courseId, e.course.title);
            }
        });

        const courses = Array.from(courseMap.entries()).map(([id, title]) => ({ id, title }));

        const students = enrollments.map(e => {
            const totalLessons = lessonCountMap.get(e.courseId) || 0;
            // Use the progressPercent field on Enrollment directly 
            const progress = e.progressPercent;

            return {
                id: e.id,
                userId: e.userId,
                name: e.user.name || "Unknown Student",
                email: e.user.email,
                image: e.user.avatar,
                courseId: e.courseId,
                courseName: e.course.title,
                enrolledAt: e.enrolledAt,
                progress,
                completedLessons: Math.round((progress / 100) * totalLessons),
                totalLessons
            };
        });

        return { success: true, students, courses };
    } catch (error) {
        console.error("Failed to fetch instructor students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}
