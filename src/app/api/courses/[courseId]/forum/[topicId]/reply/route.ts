import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string; topicId: string }> }) {
    try {
        const user = await requireApiAuth(req);
        const { topicId, courseId } = await params;
        const body = await req.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const reply = await prisma.forumReply.create({
            data: {
                content,
                topicId,
                authorId: user.id,
            },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
            }
        });

        // Optionally, notify the topic author if it's someone else
        const topic = await prisma.forumTopic.findUnique({ where: { id: topicId }, select: { authorId: true, title: true } });
        if (topic && topic.authorId !== user.id) {
            await prisma.notification.create({
                data: {
                    userId: topic.authorId,
                    type: 'FORUM_REPLY',
                    title: 'New Reply to Your Topic',
                    message: `Someone replied to your topic: "${topic.title}"`,
                    linkUrl: `/student/courses/${courseId}`
                }
            }).catch((e: unknown) => logger.error({ e }, "Failed to create notification for forum reply"));
        }

        return NextResponse.json(reply);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error creating forum reply");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
