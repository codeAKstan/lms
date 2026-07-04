"use server";

import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuizQuestionDraft = {
    id?: string;
    question: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    options: string[];
    correctAnswer: string | string[];
    explanation?: string;
    hintText?: string;
    hintImage?: string;
    points: number;
    position: number;
};

export type QuizDraft = {
    title: string;
    description?: string;
    passingScore: number;
    timeLimit?: number;
    questions: QuizQuestionDraft[];
};

// ─── Instructor Actions ────────────────────────────────────────────────────────

/** Upsert an entire quiz (create or fully replace) for a given lesson */
export async function saveQuiz(lessonId: string, draft: QuizDraft) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const totalPoints = draft.questions.reduce((sum, q) => sum + (q.points || 5), 0);

    // Find existing quiz for this lesson
    const existing = await prisma.quiz.findFirst({ where: { lessonId } });

    if (existing) {
        // Delete old questions and replace
        await prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });

        const updated = await prisma.quiz.update({
            where: { id: existing.id },
            data: {
                title: draft.title,
                description: draft.description,
                passingScore: draft.passingScore,
                timeLimit: draft.timeLimit,
                totalPoints,
                questions: {
                    create: draft.questions.map((q) => ({
                        question: q.question,
                        type: q.type,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        hintText: q.hintText,
                        hintImage: q.hintImage,
                        points: q.points,
                        position: q.position,
                    })),
                },
            },
            include: { questions: true },
        });
        revalidatePath(`/instructor/courses`);
        return { success: true, quiz: updated };
    } else {
        const created = await prisma.quiz.create({
            data: {
                title: draft.title,
                description: draft.description,
                passingScore: draft.passingScore,
                timeLimit: draft.timeLimit,
                totalPoints,
                lessonId,
                questions: {
                    create: draft.questions.map((q) => ({
                        question: q.question,
                        type: q.type,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        hintText: q.hintText,
                        hintImage: q.hintImage,
                        points: q.points,
                        position: q.position,
                    })),
                },
            },
            include: { questions: true },
        });
        revalidatePath(`/instructor/courses`);
        return { success: true, quiz: created };
    }
}

/** Fetch quiz for a lesson (instructor editing) */
export async function getQuizForLesson(lessonId: string) {
    noStore();
    const quiz = await prisma.quiz.findFirst({
        where: { lessonId },
        include: {
            questions: { orderBy: { position: "asc" } },
        },
    });
    return quiz;
}

// ─── Student Actions ───────────────────────────────────────────────────────────

/** Fetch a quiz for a student to take */
export async function getStudentQuiz(lessonId: string) {
    noStore();
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const quiz = await prisma.quiz.findFirst({
        where: { lessonId },
        include: {
            questions: { orderBy: { position: "asc" } },
            lesson: {
                include: {
                    module: {
                        include: { course: { select: { title: true, id: true } } }
                    }
                }
            }
        },
    });
    if (!quiz) return null;

    // Check for an existing in-progress attempt (no completedAt)
    const existingAttempt = await prisma.quizAttempt.findFirst({
        where: { userId: user.id, quizId: quiz.id, completedAt: null },
        orderBy: { attemptedAt: "desc" },
    });

    return {
        quiz,
        existingAttempt,
        userId: user.id,
    };
}

/** Save progress without submitting */
export async function saveQuizProgress(
    quizId: string,
    answers: Record<string, string | string[]>,
    markedForReview: string[]
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Upsert in-progress attempt
    const existing = await prisma.quizAttempt.findFirst({
        where: { userId: user.id, quizId, completedAt: null },
    });

    if (existing) {
        await prisma.quizAttempt.update({
            where: { id: existing.id },
            data: { answers, markedForReview },
        });
    } else {
        await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                quizId,
                answers,
                markedForReview,
                score: 0,
                passed: false,
            },
        });
    }
    return { success: true };
}

/** Submit the quiz and calculate score */
export async function submitQuiz(
    quizId: string,
    answers: Record<string, string | string[]>
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true },
    });
    if (!quiz) throw new Error("Quiz not found");

    // Calculate score
    let earned = 0;
    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

    for (const q of quiz.questions) {
        const given = answers[q.id];
        const correct = q.correctAnswer;
        if (Array.isArray(correct)) {
            // multi-select: all must match
            const givenArr = Array.isArray(given) ? [...given].sort() : [];
            const correctArr = [...(correct as string[])].sort();
            if (JSON.stringify(givenArr) === JSON.stringify(correctArr)) earned += q.points;
        } else {
            if (given === correct) earned += q.points;
        }
    }

    const scorePercent = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
    const passed = scorePercent >= quiz.passingScore;

    // Close any in-progress attempt or create a new one
    const existing = await prisma.quizAttempt.findFirst({
        where: { userId: user.id, quizId, completedAt: null },
    });

    if (existing) {
        await prisma.quizAttempt.update({
            where: { id: existing.id },
            data: { answers, score: scorePercent, passed, completedAt: new Date() },
        });
    } else {
        await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                quizId,
                answers,
                score: scorePercent,
                passed,
                completedAt: new Date(),
            },
        });
    }

    revalidatePath(`/student/courses`);
    return { success: true, score: scorePercent, passed, totalPoints, earned, passingScore: quiz.passingScore };
}
