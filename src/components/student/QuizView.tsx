"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, Loader2, AlertCircle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    explanation?: string | null;
    position: number;
}

interface QuizData {
    id: string;
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimit?: number | null;
    questions: QuizQuestion[];
    attempts: { id: string; score: number; passed: boolean; attemptedAt: string }[];
}

interface AttemptResult {
    score: number;
    passed: boolean;
    passingScore: number;
    correct: number;
    total: number;
    results: Record<string, {
        isCorrect: boolean;
        correctAnswer: unknown;
        explanation: string | null;
    }>;
}

interface QuizViewProps {
    quizId: string;
    onComplete?: () => void;
}

// ── QuizView Component ───────────────────────────────────────────────────────

export default function QuizView({ quizId, onComplete }: QuizViewProps) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentStep, setCurrentStep] = useState<"start" | "taking" | "results">("start");
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [showExplainer, setShowExplainer] = useState(false);

    // Fetch quiz data
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/quiz/${quizId}`);
                if (!res.ok) throw new Error("Failed to load quiz");
                const data = await res.json();
                setQuiz(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (currentStep !== "taking" || timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, timeLeft]);

    const handleStart = () => {
        if (!quiz) return;
        if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60);
        setAnswers({});
        setCurrentQIdx(0);
        setCurrentStep("taking");
    };

    const handleAnswer = (questionId: string, value: string) => {
        const q = quiz?.questions[currentQIdx];
        if (!q) return;

        if (q.type === "MULTI_SELECT") {
            const prev = (answers[questionId] as string[]) ?? [];
            const updated = prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value];
            setAnswers(prev => ({ ...prev, [questionId]: updated }));
        } else {
            setAnswers(prev => ({ ...prev, [questionId]: value }));
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!quiz) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/quiz/${quizId}/attempt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
            });
            if (!res.ok) throw new Error("Submission failed");
            const data = await res.json();
            setResult(data);
            setCurrentStep("results");
            if (data.passed && onComplete) onComplete();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Submission error");
        } finally {
            setIsSubmitting(false);
        }
    }, [quiz, quizId, answers, onComplete]);

    const handleRetry = () => {
        setResult(null);
        setShowExplainer(false);
        setCurrentStep("start");
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    // ── Render States ──────────────────────────────────────────────────────────

    if (isLoading) return (
        <div className="flex h-48 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
        </div>
    );

    if (!quiz) return null;

    const currentQ = quiz.questions[currentQIdx];
    const isLastQ = currentQIdx === quiz.questions.length - 1;
    const currentAnswer = answers[currentQ?.id ?? ""];
    const isAnswered = currentAnswer !== undefined &&
        (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== "");

    // ── Start Screen ──────────────────────────────────────────────────────────
    if (currentStep === "start") {
        const lastAttempt = quiz.attempts[0];
        return (
            <div className="bg-white rounded-2xl border border-muted p-8 text-center space-y-6">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                    <Trophy className="w-10 h-10 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-accent mb-2">{quiz.title}</h2>
                    {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
                </div>
                <div className="flex justify-center gap-8 text-sm">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{quiz.questions.length}</p>
                        <p className="text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{quiz.passingScore}%</p>
                        <p className="text-muted-foreground">Pass Mark</p>
                    </div>
                    {quiz.timeLimit && (
                        <div className="text-center">
                            <p className="text-2xl font-bold text-accent">{quiz.timeLimit}</p>
                            <p className="text-muted-foreground">Minutes</p>
                        </div>
                    )}
                </div>
                {lastAttempt && (
                    <div className={`p-3 rounded-xl text-sm font-medium border ${lastAttempt.passed ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        Last attempt: {lastAttempt.score}% — {lastAttempt.passed ? "Passed ✓" : "Failed ✗"}
                    </div>
                )}
                <button
                    onClick={handleStart}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                    {quiz.attempts.length > 0 ? "Retry Quiz" : "Start Quiz"}
                </button>
            </div>
        );
    }

    // ── Taking Screen ─────────────────────────────────────────────────────────
    if (currentStep === "taking") {
        return (
            <div className="bg-white rounded-2xl border border-muted overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-muted flex items-center justify-between bg-gray-50">
                    <span className="text-sm font-medium text-muted-foreground">
                        Question {currentQIdx + 1} of {quiz.questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                        {/* Progress bar */}
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${((currentQIdx + 1) / quiz.questions.length) * 100}%` }}
                            />
                        </div>
                        {timeLeft !== null && (
                            <span className={`flex items-center gap-1 text-sm font-bold ${timeLeft < 60 ? "text-red-500" : "text-accent"}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Question */}
                <div className="p-6 space-y-6">
                    <p className="text-lg font-semibold text-accent leading-relaxed">{currentQ.question}</p>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQ.options.map((opt, i) => {
                            const letter = ["A", "B", "C", "D", "E"][i];
                            const isSelected = currentQ.type === "MULTI_SELECT"
                                ? (currentAnswer as string[] ?? []).includes(opt)
                                : currentAnswer === opt;

                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(currentQ.id, opt)}
                                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected
                                            ? "border-primary bg-primary/8 text-primary font-medium"
                                            : "border-gray-200 hover:border-gray-300 text-accent"
                                        }`}
                                >
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {letter}
                                    </span>
                                    <span className="text-sm">{opt}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Nav */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={() => setCurrentQIdx(i => i - 1)}
                            disabled={currentQIdx === 0}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-accent disabled:opacity-40 transition"
                        >
                            ← Previous
                        </button>

                        {isLastQ ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isAnswered}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQIdx(i => i + 1)}
                                disabled={!isAnswered}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Results Screen ────────────────────────────────────────────────────────
    if (currentStep === "results" && result) {
        return (
            <div className="bg-white rounded-2xl border border-muted overflow-hidden">
                {/* Score banner */}
                <div className={`p-8 text-center ${result.passed ? "bg-green-50" : "bg-red-50"}`}>
                    <div className={`inline-flex p-4 rounded-full mb-4 ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
                        {result.passed
                            ? <CheckCircle className="w-12 h-12 text-green-600" />
                            : <XCircle className="w-12 h-12 text-red-600" />
                        }
                    </div>
                    <h2 className={`text-3xl font-bold mb-1 ${result.passed ? "text-green-700" : "text-red-700"}`}>
                        {result.score}%
                    </h2>
                    <p className={`font-semibold text-lg ${result.passed ? "text-green-600" : "text-red-600"}`}>
                        {result.passed ? "🎉 You Passed!" : `Not quite — need ${result.passingScore}% to pass`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {result.correct} of {result.total} correct
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Answer Review Toggle */}
                    <button
                        onClick={() => setShowExplainer(!showExplainer)}
                        className="w-full py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        {showExplainer ? "Hide" : "Review"} Answers
                    </button>

                    {showExplainer && (
                        <div className="space-y-4">
                            {quiz.questions.map((q, idx) => {
                                const res = result.results[q.id];
                                const submitted = answers[q.id];
                                return (
                                    <div key={q.id} className={`p-4 rounded-xl border ${res.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                                        <div className="flex items-start gap-2 mb-2">
                                            {res.isCorrect
                                                ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                : <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            }
                                            <p className="text-sm font-semibold text-accent">
                                                Q{idx + 1}: {q.question}
                                            </p>
                                        </div>
                                        <div className="ml-6 text-xs space-y-1">
                                            <p className="text-muted-foreground">
                                                Your answer: <span className={`font-semibold ${res.isCorrect ? "text-green-700" : "text-red-700"}`}>
                                                    {Array.isArray(submitted) ? submitted.join(", ") : submitted ?? "—"}
                                                </span>
                                            </p>
                                            {!res.isCorrect && (
                                                <p className="text-muted-foreground">
                                                    Correct: <span className="font-semibold text-green-700">
                                                        {Array.isArray(res.correctAnswer)
                                                            ? (res.correctAnswer as string[]).join(", ")
                                                            : String(res.correctAnswer)}
                                                    </span>
                                                </p>
                                            )}
                                            {res.explanation && (
                                                <p className="text-gray-500 mt-1 italic">{res.explanation}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!result.passed && (
                        <button
                            onClick={handleRetry}
                            className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
