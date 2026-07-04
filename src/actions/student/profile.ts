"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getStudentProfileSidebar(studentId: string) {
    noStore();
    try {
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { name: true, avatar: true, bio: true, title: true }
        });

        return {
            success: true,
            profile: student ? {
                name: student.name,
                avatar: student.avatar,
                bio: student.bio,
                title: student.title
            } : null
        };
    } catch (error) {
        console.error("Student profile fetch error:", error);
        return { success: false, error: "Failed to fetch student profile", profile: null };
    }
}
