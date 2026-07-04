import { getAuthenticatedUser } from "@/lib/auth-api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionGradeSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthenticatedUser(req);
        const { id } = await params;

        if (!authUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Role Check
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { role: true }
        });

        if (user?.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const parsed = submissionGradeSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid input", { status: 400 });
        }
        const { grade, feedback } = parsed.data;

        const submission = await prisma.submission.update({
            where: {
                id: id,
            },
            data: {
                grade,
                feedback,
            },
        });

        return NextResponse.json(submission);
    } catch (error) {
        logger.error({ error }, "[SUBMISSION_PATCH]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}
