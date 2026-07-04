import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { quizAttemptSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

// POST /api/quiz/[quizId]/attempt — submit answers, score, and record attempt
export async function POST(
    req: Request,
    { params }: { params: Promise<{ quizId: string }> }
) {
    const { quizId } = await params;

    try {
        const user = await getAuthenticatedUser(req);
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const parsed = quizAttemptSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid answers format", { status: 400 });
        }
        const { answers } = parsed.data;

        // 1. Fetch quiz with correct answers
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: { orderBy: { position: "asc" } },
            },
        });

        if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

        // 2. Score the answers
        let correct = 0;
        const results: Record<string, {
            isCorrect: boolean;
            correctAnswer: unknown;
            explanation: string | null;
        }> = {};

        for (const q of quiz.questions) {
            const submitted = answers[q.id];
            const correct_ans = q.correctAnswer;
            let isCorrect = false;

            if (q.type === "MULTI_SELECT") {
                // Both must be arrays with same values
                const submittedArr = Array.isArray(submitted) ? [...submitted].sort() : [];
                const correctArr = Array.isArray(correct_ans) ? [...(correct_ans as string[])].sort() : [];
                isCorrect = JSON.stringify(submittedArr) === JSON.stringify(correctArr);
            } else {
                // MULTIPLE_CHOICE or TRUE_FALSE — compare as strings
                isCorrect = String(submitted) === String(correct_ans);
            }

            if (isCorrect) correct++;

            results[q.id] = {
                isCorrect,
                correctAnswer: correct_ans,
                explanation: q.explanation,
            };
        }

        const total = quiz.questions.length;
        const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
        const passed = scorePercent >= quiz.passingScore;

        // 3. Save attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                quizId,
                answers,
                score: scorePercent,
                passed,
            },
        });

        return NextResponse.json({
            attemptId: attempt.id,
            score: scorePercent,
            passed,
            passingScore: quiz.passingScore,
            correct,
            total,
            results,
        });

    } catch (error) {
        logger.error({ error }, "[QUIZ_ATTEMPT_POST]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}
