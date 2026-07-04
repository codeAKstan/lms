import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

// GET /api/quiz/[quizId] — fetch quiz with questions (hide correct answers)
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ quizId: string }> }
) {
    const { quizId } = await params;

    try {
        const user = await getAuthenticatedUser(_req);
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { position: "asc" },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        type: true,
                        explanation: true,
                        position: true,
                        // DO NOT include correctAnswer — sent only after submission
                    },
                },
                // Get user's previous attempts
                attempts: {
                    where: { userId: user.id },
                    orderBy: { attemptedAt: "desc" },
                    take: 5,
                    select: { id: true, score: true, passed: true, attemptedAt: true }
                }
            },
        });

        if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

        return NextResponse.json(quiz);
    } catch (error) {
        logger.error({ error }, "[QUIZ_GET]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}
