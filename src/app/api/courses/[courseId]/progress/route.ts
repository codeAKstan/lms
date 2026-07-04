import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/email";
import { completionTemplate } from "@/lib/email-templates";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { progressUpdateSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        const user = await getAuthenticatedUser(req);

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Get Enrollment Details
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json({ progress: 0, completedLessons: [] });
        }

        // 2. Get Completed Lessons for this user in this course
        // We need to filter by lessons that actually belong to this course
        const completedLessons = await prisma.lessonProgress.findMany({
            where: {
                userId: user.id,
                completed: true,
                lesson: {
                    module: {
                        courseId: courseId
                    }
                }
            },
            select: {
                lessonId: true
            }
        });

        const completedLessonIds = completedLessons.map(p => p.lessonId);

        return NextResponse.json({
            progress: enrollment.progressPercent,
            completedLessons: completedLessonIds
        });

    } catch (error) {
        logger.error({ error }, "[PROGRESS_GET]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        const user = await getAuthenticatedUser(req);

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const parsed = progressUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid input", { status: 400 });
        }
        const { lessonId, completed } = parsed.data;

        // 1. Upsert Lesson Progress
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId
                }
            },
            update: {
                completed: completed ?? true,
                completedAt: completed ? new Date() : null,
            },
            create: {
                userId: user.id,
                lessonId: lessonId,
                completed: completed ?? true,
                completedAt: new Date()
            }
        });

        // 2. Parallelize Data Fetching for Progress Calculation
        const [totalLessons, completedCount, currentEnrollment] = await Promise.all([
            prisma.lesson.count({
                where: { module: { courseId: courseId } }
            }),
            prisma.lessonProgress.count({
                where: {
                    userId: user.id,
                    completed: true,
                    lesson: { module: { courseId: courseId } }
                }
            }),
            prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: courseId } },
                select: { completedAt: true }
            })
        ]);

        const progressPercent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
        const isNewlyCompleted = progressPercent === 100 && !currentEnrollment?.completedAt;

        // 3. Update Enrollment progress
        const enrollment = await prisma.enrollment.update({
            where: {
                userId_courseId: { userId: user.id, courseId: courseId }
            },
            data: {
                progressPercent: progressPercent,
                lastAccessedAt: new Date(),
                // Only set completedAt if it wasn't already set
                ...(isNewlyCompleted && { completedAt: new Date() })
            }
        });

        // 4. Send Course Completion Email if reaching 100% just now (Parallel User & Course Fetch)
        if (isNewlyCompleted) {
            try {
                const [course, dbUser] = await Promise.all([
                    prisma.course.findUnique({
                        where: { id: courseId },
                        select: { title: true }
                    }),
                    prisma.user.findUnique({
                        where: { id: user.id },
                        select: { name: true, email: true }
                    })
                ]);

                if (dbUser?.email && dbUser?.name && course?.title) {
                    EmailService.send({
                        to: dbUser.email,
                        subject: `Congratulations on completing ${course.title}!`,
                        html: completionTemplate(dbUser.name, course.title)
                    }).catch(e => logger.error({ error: e }, "Failed to send completion email"));
                }
            } catch (err) {
                logger.error({ error: err }, "Error sending completion email");
            }
        }

        return NextResponse.json({
            success: true,
            progress: progressPercent,
            courseCompleted: enrollment.completedAt !== null
        });

    } catch (error) {
        logger.error({ error }, "[PROGRESS_PUT]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST() {
    return new NextResponse(
        "Method Not Allowed. Use PUT to update progress.", 
        { status: 405 }
    );
}
