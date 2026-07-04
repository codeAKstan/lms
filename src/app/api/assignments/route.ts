import { logger } from '@/lib/logger'
import { getAuthenticatedUser } from "@/lib/auth-api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const authUser = await getAuthenticatedUser(req);

        if (!authUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch user role
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { role: true }
        });

        if (user?.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title, description, lessonId, maxScore } = await req.json();

        if (!title || !lessonId) {
            return new NextResponse("Title and Lesson ID are required", { status: 400 });
        }

        // Check if assignment already exists for this lesson
        const existing = await prisma.assignment.findUnique({
            where: { lessonId },
        });

        if (existing) {
            // Update existing
            const assignment = await prisma.assignment.update({
                where: { id: existing.id },
                data: {
                    title,
                    description,
                    maxScore: Number(maxScore),
                }
            });
            return NextResponse.json(assignment);
        }

        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                lessonId,
                maxScore: Number(maxScore),
            },
        });

        return NextResponse.json(assignment);
    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Error", { status: 500 });
    }
}


