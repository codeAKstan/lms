"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Validates the authenticated user from cookies
 */
async function requireAuth() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    return { user, supabase };
}

/**
 * Securely grades a quiz attempt on the server
 */
export async function submitQuizAttempt(quizId: string, studentAnswers: Record<string, string>) {
    try {
        const { user } = await requireAuth();

        // 1. Fetch the absolute truth of the Quiz Questions from DB
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return { success: false, error: "Quiz not found" };
        }

        let correctCount = 0;
        const totalQuestions = quiz.questions.length;

        // 2. Grade each answer against the true database JSON
        quiz.questions.forEach(question => {
            const studentSelected = studentAnswers[question.id];

            // The DB stores correctAnswer as a raw string inside a JSON value, so we parse/cast it safely 
            const dbCorrectAnswer = String(question.correctAnswer).replace(/^"|"$/g, '');

            if (studentSelected && studentSelected === dbCorrectAnswer) {
                correctCount++;
            }
        });

        // 3. Calculate percentage and pass status
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        const passed = percentage >= quiz.passingScore;

        // 4. Save the Attempt to the database
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                quizId: quiz.id,
                answers: studentAnswers,
                score: percentage,
                passed: passed
            }
        });

        return {
            success: true,
            data: {
                attemptId: attempt.id,
                score: percentage,
                passed,
                passingScore: quiz.passingScore,
                totalQuestions,
                correctCount
            }
        };

    } catch (error) {
        console.error("Failed to grade quiz:", error);
        return { success: false, error: "Failed to grade your quiz try again later" };
    }
}
