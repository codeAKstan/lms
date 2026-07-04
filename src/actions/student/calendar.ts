"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getStudentCalendarSessions(userId: string) {
    noStore();
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        // 1. Get all courses the student is enrolled in
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: userId,
                course: { deletedAt: null }
            },
            select: { courseId: true }
        });

        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) {
            return { success: true, sessions: [] };
        }

        // 2. Fetch all future sessions for these courses
        const sessions = await prisma.liveSession.findMany({
            where: {
                courseId: { in: courseIds },
                // Allow seeing sessions from the start of the current month, not just from today, so they see past events in the calendar
                date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            },
            include: {
                course: {
                    select: {
                        title: true,
                        category: true,
                        instructor: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Map to a clean presentation shape
        const formattedSessions = sessions.map((session: { id: string; title: string; date: Date; duration: number; meetingUrl: string | null; course: { title: string; category: string | null; instructor: { name: string } } }) => ({
            id: session.id,
            title: session.title,
            date: session.date.toISOString(),
            duration: session.duration,
            meetingUrl: session.meetingUrl,
            courseTitle: session.course.title,
            category: session.course.category,
            instructor: session.course.instructor.name
        }));

        return { success: true, sessions: formattedSessions };

    } catch (error) {
        console.error("Error fetching student calendar:", error);
        return { success: false, error: "Failed to load calendar" };
    }
}
