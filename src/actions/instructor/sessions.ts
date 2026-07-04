"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

export async function getLiveSessions(courseId: string) {
    if (!courseId) {
        throw new Error("Course ID is required");
    }

    try {
        noStore();
        const sessions = await prisma.liveSession.findMany({
            where: { courseId },
            orderBy: { date: 'asc' }
        });

        return { success: true, sessions };
    } catch (error) {
        console.error("Error fetching live sessions:", error);
        return { success: false, error: "Failed to fetch live sessions" };
    }
}

export async function createLiveSession(data: {
    title: string;
    date: Date;
    duration: number;
    meetingUrl?: string;
    courseId: string;
}) {
    if (!data.title || !data.date || !data.duration || !data.courseId) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        const session = await prisma.liveSession.create({
            data: {
                title: data.title,
                date: new Date(data.date), // Ensure it's a date object
                duration: data.duration,
                meetingUrl: data.meetingUrl,
                courseId: data.courseId
            }
        });

        revalidatePath(`/instructor/courses/${data.courseId}/sessions`);
        revalidatePath('/student/dashboard');
        revalidatePath('/student/calendar');
        return { success: true, session };
    } catch (error) {
        console.error("Error creating live session:", error);
        return { success: false, error: "Failed to create live session" };
    }
}

export async function deleteLiveSession(sessionId: string, courseId: string) {
    if (!sessionId) {
        return { success: false, error: "Session ID is required" };
    }

    try {
        await prisma.liveSession.delete({
            where: { id: sessionId }
        });

        revalidatePath(`/instructor/courses/${courseId}/sessions`);
        revalidatePath('/student/dashboard');
        revalidatePath('/student/calendar');
        return { success: true };
    } catch (error) {
        console.error("Error deleting live session:", error);
        return { success: false, error: "Failed to delete live session" };
    }
}
