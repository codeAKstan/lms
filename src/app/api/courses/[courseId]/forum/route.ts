import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        await requireApiAuth(req);
        const { courseId } = await params;

        const topics = await prisma.forumTopic.findMany({
            where: { courseId },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                replies: {
                    include: {
                        author: { select: { id: true, name: true, avatar: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        });

        return NextResponse.json(topics);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error fetching forum topics");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const user = await requireApiAuth(req);
        const { courseId } = await params;
        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const topic = await prisma.forumTopic.create({
            data: {
                title,
                content,
                courseId,
                authorId: user.id,
            },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                replies: true,
            }
        });

        return NextResponse.json(topic);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error creating forum topic");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
