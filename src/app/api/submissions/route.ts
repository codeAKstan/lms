import { logger } from '@/lib/logger'
import { getAuthenticatedUser } from "@/lib/auth-api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        const authUser = await getAuthenticatedUser(req);

        if (!authUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const parsed = submissionCreateSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid input", { status: 400 });
        }
        const { assignmentId, fileUrl, studentNotes } = parsed.data;

        const submission = await prisma.submission.upsert({
            where: {
                userId_assignmentId: {
                    userId: authUser.id,
                    assignmentId: assignmentId,
                },
            },
            update: {
                fileUrl,
                studentNotes,
                submittedAt: new Date(),
            },
            create: {
                userId: authUser.id,
                assignmentId,
                fileUrl,
                studentNotes,
            },
        });

        return NextResponse.json(submission);
    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Error", { status: 500 });
    }
}


