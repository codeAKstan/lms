import QuizInterface from "@/components/student/QuizInterface";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuizPage({
    params,
}: {
    params: Promise<{ courseId: string; quizId: string }>;
}) {
    const { courseId, quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                orderBy: { position: "asc" },
            },
        },
    });

    if (!quiz) {
        notFound();
    }

    // Transform to the format QuizInterface expects
    const quizData = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || undefined,
        timeLimit: quiz.timeLimit || undefined,
        passingScore: quiz.passingScore,
        questions: quiz.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type === "MULTI_SELECT" ? "multi-select" as const
                : q.type === "TRUE_FALSE" ? "true-false" as const
                : "multiple-choice" as const,
            options: (q.options as string[]) || [],
            correctAnswer: q.correctAnswer as string | string[],
            explanation: q.explanation || undefined,
        })),
    };

    return (
        <div className="min-h-screen bg-surface py-12">
            <div className="container mx-auto px-4 md:px-6">
                {/* Back Link */}
                <Link
                    href={`/${courseId}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                </Link>

                {/* Quiz */}
                <QuizInterface quiz={quizData} onComplete={() => {}} />
            </div>
        </div>
    );
}
