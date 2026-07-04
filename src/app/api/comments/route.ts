import { logger } from '@/lib/logger'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { commentCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser(req);

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = user.id;

        const body = await req.json();
        const parsed = commentCreateSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid input", { status: 400 });
        }
        const { lessonId, content, parentId } = parsed.data;

        // Verify enrollment
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { module: { select: { courseId: true } } }
        });
        if (!lesson) return new NextResponse("Lesson not found", { status: 404 });
        
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
        });
        if (!enrollment) return new NextResponse("Not enrolled", { status: 403 });

        const comment = await prisma.comment.create({
            data: {
                content,
                lessonId,
                userId: userId,
                parentId: parentId || null,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                        role: true,
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Error", { status: 500 });
    }
}


