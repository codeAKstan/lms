import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

// GET /api/courses/[courseId] — full course with modules, lessons (Prisma)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const { courseId } = await params;
    const user = await getAuthenticatedUser(request);

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: {
                    select: { id: true, name: true, bio: true, avatar: true }
                },
                modules: {
                    orderBy: { position: "asc" },
                    include: {
                        lessons: {
                            orderBy: { position: "asc" },
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                duration: true,
                                position: true,
                                isFree: true,
                                content: true,
                                videoUrl: true,
                                muxPlaybackId: true,
                                // Only include quizzes linked to this lesson
                                quizzes: {
                                    select: {
                                        id: true,
                                        title: true,
                                        passingScore: true,
                                        timeLimit: true,
                                        _count: { select: { questions: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Only expose full content to enrolled users or for free lessons
        // For unauthenticated or non-enrolled, we still return the structure but hide video IDs
        const isEnrolled = user
            ? !!(await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId } }
            }))
            : false;

        const safeModules = course.modules.map(mod => ({
            ...mod,
            lessons: mod.lessons.map(lesson => ({
                ...lesson,
                // Hide playback IDs if not enrolled and not a free lesson
                muxPlaybackId: (isEnrolled || lesson.isFree) ? lesson.muxPlaybackId : null,
                videoUrl: (isEnrolled || lesson.isFree) ? lesson.videoUrl : null,
                content: (isEnrolled || lesson.isFree) ? lesson.content : null,
            }))
        }));

        return NextResponse.json({ ...course, modules: safeModules });

    } catch (error) {
        logger.error({ error }, "[COURSE_GET]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}
