"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flag, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getStudentQuiz, saveQuizProgress, submitQuiz } from "@/actions/quiz";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
    id: string;
    question: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    options: string[];
    correctAnswer: string | string[];
    explanation?: string | null;
    hintText?: string | null;
    hintImage?: string | null;
    points: number;
    position: number;
};

type QuizData = {
    id: string;
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimit?: number | null;
    totalPoints: number;
    questions: Question[];
    lesson: {
        module: {
            title: string;
            course: { title: string; id: string };
        };
    };
};

type Result = {
    score: number;
    passed: boolean;
    totalPoints: number;
    earned: number;
    passingScore: number;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string;
    const courseId = params.courseId as string;

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [markedForReview, setMarkedForReview] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        async function load() {
            const data = await getStudentQuiz(lessonId);
            if (!data?.quiz) {
                toast.error("Quiz not found.");
                router.push(`/student/courses/${courseId}`);
                return;
            }
            setQuizData(data.quiz as unknown as QuizData);
            // Restore any saved progress
            if (data.existingAttempt?.answers) {
                setAnswers(data.existingAttempt.answers as Record<string, string | string[]>);
            }
            if (data.existingAttempt?.markedForReview) {
                setMarkedForReview(data.existingAttempt.markedForReview as string[]);
            }
            setIsLoading(false);
        }
        load();
    }, [lessonId, courseId, router]);

    const currentQuestion = quizData?.questions[currentIndex];
    const totalQuestions = quizData?.questions.length ?? 0;
    const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

    const handleSelect = (option: string) => {
        if (!currentQuestion || result) return;
        if (currentQuestion.type === "MULTI_SELECT") {
            const prev = (answers[currentQuestion.id] as string[]) ?? [];
            const next = prev.includes(option)
                ? prev.filter((o) => o !== option)
                : [...prev, option];
            setAnswers((a) => ({ ...a, [currentQuestion.id]: next }));
        } else {
            setAnswers((a) => ({ ...a, [currentQuestion.id]: option }));
        }
    };

    const toggleMark = () => {
        if (!currentQuestion) return;
        setMarkedForReview((prev) =>
            prev.includes(currentQuestion.id)
                ? prev.filter((id) => id !== currentQuestion.id)
                : [...prev, currentQuestion.id]
        );
    };

    const handleSave = useCallback(async () => {
        if (!quizData) return;
        setIsSaving(true);
        try {
            await saveQuizProgress(quizData.id, answers, markedForReview);
            toast.success("Progress saved!");
        } catch {
            toast.error("Failed to save progress.");
        } finally {
            setIsSaving(false);
        }
    }, [quizData, answers, markedForReview]);

    const handleSubmit = async () => {
        if (!quizData) return;
        setIsSubmitting(true);
        try {
            const res = await submitQuiz(quizData.id, answers);
            setResult(res);
        } catch {
            toast.error("Failed to submit quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#006a6a] animate-spin" />
            </div>
        );
    }

    if (!quizData || !currentQuestion) return null;

    const isMarked = markedForReview.includes(currentQuestion.id);
    const selectedAnswer = answers[currentQuestion.id];

    // ── Result Screen ─────────────────────────────────────────────────────────
    if (result) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Course</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-semibold text-gray-800 text-sm">{quizData.lesson.module.course.title}</span>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-10 max-w-md w-full text-center space-y-6">
                        {result.passed ? (
                            <CheckCircle2 className="w-16 h-16 text-[#006a6a] mx-auto" />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {result.passed ? "Quiz Passed! 🎉" : "Not Quite There"}
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {result.passed
                                    ? "Excellent work! You've demonstrated a strong understanding of the material."
                                    : "Keep studying and try again. You've got this!"}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Your Score</span>
                                <span className="font-bold text-gray-900">{result.score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-1000 ${result.passed ? "bg-[#006a6a]" : "bg-red-400"}`}
                                    style={{ width: `${result.score}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Passing score: {result.passingScore}%</span>
                                <span>{result.earned} / {result.totalPoints} pts</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/student/courses/${courseId}`)}
                                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Back to Course
                            </button>
                            {!result.passed && (
                                <button
                                    onClick={() => { setResult(null); setAnswers({}); setCurrentIndex(0); }}
                                    className="flex-1 px-6 py-3 bg-[#006a6a] text-white rounded-xl font-semibold hover:bg-[#005555] transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Quiz Screen ───────────────────────────────────────────────────────────
    const typeLabel: Record<string, string> = {
        MULTIPLE_CHOICE: "Single Choice",
        TRUE_FALSE: "True / False",
        MULTI_SELECT: "Multi Select",
    };

    const isSelected = (option: string) => {
        if (Array.isArray(selectedAnswer)) return selectedAnswer.includes(option);
        return selectedAnswer === option;
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Course</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-semibold text-gray-800 text-sm truncate max-w-xs sm:max-w-sm md:max-w-md">
                        {quizData.lesson.module.course.title}
                    </span>
                </div>
                <button
                    onClick={() => router.push(`/student/courses/${courseId}`)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <X className="w-4 h-4" /> Exit Quiz
                </button>
            </header>

            {/* ── Progress ────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-6 pt-5 pb-4">
                <p className="text-xs font-bold text-[#006a6a] uppercase tracking-widest mb-1">
                    {quizData.lesson.module.title} — Module Assessment
                </p>
                <div className="flex items-end justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{quizData.title}</h1>
                    <span className="text-sm font-bold text-gray-500 ml-4 shrink-0">
                        <span className="text-gray-900">{String(currentIndex + 1).padStart(2, "0")}</span>
                        /{String(totalQuestions).padStart(2, "0")}
                    </span>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                        className="h-1.5 rounded-full bg-[#006a6a] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ── Question Card ────────────────────────────────────────────── */}
            <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Meta pills */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wide">
                                Question {currentIndex + 1}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-semibold text-gray-500">
                                {typeLabel[currentQuestion.type]}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-semibold text-gray-500">
                                {currentQuestion.points} {currentQuestion.points === 1 ? "Point" : "Points"}
                            </span>
                            {isMarked && (
                                <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                                        <Flag className="w-3 h-3 fill-current" /> Marked for Review
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Question text */}
                        <p className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed mb-6">
                            {currentQuestion.question}
                        </p>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, i) => {
                                const selected = isSelected(option);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(option)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${selected
                                            ? "border-[#006a6a] bg-[#006a6a]/5"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Radio / Checkbox indicator */}
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected
                                            ? "border-[#006a6a] bg-[#006a6a]"
                                            : "border-gray-300"
                                            }`}>
                                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-sm leading-snug ${selected ? "text-[#006a6a] font-semibold" : "text-gray-700"}`}>
                                            {option}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hint box */}
                        {(currentQuestion.hintText || currentQuestion.hintImage) && (
                            <div className="mt-7 flex items-start gap-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 p-4">
                                {currentQuestion.hintImage && (
                                    <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                        <Image
                                            src={currentQuestion.hintImage}
                                            alt="Hint"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                {currentQuestion.hintText && (
                                    <p className="text-sm text-gray-500 italic leading-relaxed">
                                        <span className="font-semibold not-italic text-gray-600">Tip: </span>
                                        {currentQuestion.hintText}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Question navigator dots */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {quizData.questions.map((q, i) => {
                        const answered = !!answers[q.id];
                        const marked = markedForReview.includes(q.id);
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                title={`Question ${i + 1}`}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${i === currentIndex
                                    ? "bg-[#006a6a] text-white scale-110 shadow"
                                    : marked
                                        ? "bg-amber-400 text-white"
                                        : answered
                                            ? "bg-[#006a6a]/20 text-[#006a6a]"
                                            : "bg-white border border-gray-200 text-gray-400"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* ── Sticky Action Bar ────────────────────────────────────────── */}
            <footer className="sticky bottom-0 z-20 bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                    {/* Left: mark + navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMark}
                            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${isMarked
                                ? "border-amber-300 bg-amber-50 text-amber-600"
                                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }`}
                        >
                            <Flag className={`w-4 h-4 ${isMarked ? "fill-amber-400" : ""}`} />
                            <span className="hidden sm:inline">Mark for Review</span>
                        </button>
                        {currentIndex > 0 && (
                            <button
                                onClick={() => setCurrentIndex((i) => i - 1)}
                                className="px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ← Prev
                            </button>
                        )}
                        {currentIndex < totalQuestions - 1 && (
                            <button
                                onClick={() => setCurrentIndex((i) => i + 1)}
                                className="px-3 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Next →
                            </button>
                        )}
                    </div>

                    {/* Right: save & submit */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#006a6a] text-white text-sm font-semibold rounded-xl hover:bg-[#005555] transition-colors disabled:opacity-60"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Progress
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#e6b800] text-[#1a1a00] text-sm font-bold rounded-xl hover:bg-[#d4a800] transition-colors disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Submit Answer
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
