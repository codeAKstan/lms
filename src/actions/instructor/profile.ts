"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getInstructorTrack(instructorId: string) {
    noStore();
    try {
        const instructorCourses = await prisma.course.findMany({
            where: { instructorId },
            select: { category: true }
        });

        const instructor = await prisma.user.findUnique({
            where: { id: instructorId },
            select: { name: true, avatar: true, honorific: true, title: true, expertise: true }
        });

        let track = "Instructor";
        if (instructorCourses.length > 0) {
            const categoryCounts = instructorCourses.reduce((acc, c) => {
                acc[c.category] = (acc[c.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            track = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Instructor";
        }

        return { 
            success: true, 
            track,
            profile: instructor ? { 
                name: instructor.name, 
                avatar: instructor.avatar,
                honorific: instructor.honorific,
                title: instructor.title,
                expertise: instructor.expertise
            } : null
        };
    } catch (error) {
        console.error("Profile track fetch error:", error);
        return { success: false, error: "Failed to fetch track", track: "Instructor" };
    }
}
