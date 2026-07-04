"use client";

import { useState } from "react";
import { Check, X, ChevronRight, RotateCcw, Loader2 } from "lucide-react";

interface Question {
    id: string;
    question: string;
    options: string[];
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
    explanation?: string;
    // Note: correctAnswer is intentionally omitted for security
}

interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    passingScore: number;
}

interface QuizPlayerProps {
    quiz: Quiz;
    onComplete: (score: number, passed: boolean) => void;
}

export default function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});

    // Grading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [hasPassed, setHasPassed] = useState(false);

    // Safety check
    if (!quiz?.questions || quiz.questions.length === 0) {
        return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">No questions available in this quiz.</div>;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // Handle single-choice selections
    const handleSelectOption = (option: string) => {
        if (isSubmitting || showResults) return;

        if (currentQuestion.type === "MULTI_SELECT") {
            const currentSelected = (selectedAnswers[currentQuestion.id] as string[]) || [];
            if (currentSelected.includes(option)) {
                setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: currentSelected.filter(o => o !== option) });
            } else {
                setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: [...currentSelected, option] });
            }
        } else {
            setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: option });
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            submitQuiz();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const submitQuiz = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/quiz/${quiz.id}/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: selectedAnswers })
            });

            if (!response.ok) throw new Error("Failed to grade quiz");

            const result = await response.json();

            setFinalScore(result.score);
            setHasPassed(result.passed);
            setShowResults(true);

            onComplete(result.score, result.passed);

        } catch (error) {
            console.error("Quiz grading error:", error);
            alert("Failed to grade your quiz. Please try submitting again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setFinalScore(0);
        setHasPassed(false);
    };

    if (showResults) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${hasPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {hasPassed ? <Check className="w-12 h-12" strokeWidth={3} /> : <X className="w-12 h-12" strokeWidth={3} />}
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    {hasPassed ? "Quiz Passed!" : "Quiz Failed"}
                </h2>

                <p className="text-gray-500 text-lg mb-8 font-medium">
                    You scored <span className={`font-bold ${hasPassed ? 'text-emerald-600' : 'text-red-600'}`}>{finalScore}%</span>
                    <span className="text-sm ml-2 opacity-70">(Passing score: {quiz.passingScore}%)</span>
                </p>

                {hasPassed ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 mb-6 font-medium tracking-wide">
                        🎓 Great job! You have successfully completed this lesson.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-5 bg-red-50 border border-red-100 rounded-xl text-red-800 font-medium">
                            Don&apos;t worry, you can always try again to improve your score.
                        </div>
                        <button
                            onClick={resetQuiz}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 hover:shadow-lg transition-all"
                        >
                            <RotateCcw className="w-5 h-5" /> Retake Quiz
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const currentSelection = selectedAnswers[currentQuestion?.id];
    const isAnswered = currentQuestion?.type === "MULTI_SELECT"
        ? Array.isArray(currentSelection) && currentSelection.length > 0
        : !!currentSelection;

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            {/* Progress Header */}
            <div className="mb-10">
                <div className="flex items-end justify-between text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">
                    <span>Question {currentQuestionIndex + 1} <span className="text-gray-300 mx-1">/</span> {quiz.questions.length}</span>
                    <span className="text-emerald-600">{Math.round((currentQuestionIndex / quiz.questions.length) * 100)}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${(currentQuestionIndex / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Body */}
            <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={currentQuestion.id}>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3.5 mb-10">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = currentQuestion.type === "MULTI_SELECT"
                            ? Array.isArray(currentSelection) && currentSelection.includes(option)
                            : currentSelection === option;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(option)}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group ${isSelected
                                        ? "border-emerald-500 bg-emerald-50/50 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex-shrink-0 flex items-center justify-center transition-colors ${currentQuestion.type === "MULTI_SELECT"
                                            ? `w-6 h-6 rounded border-2 ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 group-hover:border-gray-400"}`
                                            : `w-6 h-6 rounded-full border-2 ${isSelected ? "border-emerald-500" : "border-gray-300 group-hover:border-gray-400"}`
                                        }`}>
                                        {isSelected && currentQuestion.type === "MULTI_SELECT" && <Check className="w-4 h-4" strokeWidth={3} />}
                                        {isSelected && currentQuestion.type !== "MULTI_SELECT" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-in zoom-in" />}
                                    </div>
                                    <span className={`text-lg transition-colors ${isSelected ? "text-emerald-900 font-bold" : "text-gray-700 font-medium"}`}>
                                        {option}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0 || isSubmitting}
                        className="px-6 py-3 text-gray-500 font-semibold hover:text-gray-900 disabled:opacity-0 transition-all"
                    >
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!isAnswered || isSubmitting}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm ${isAnswered
                                ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Grading...</>
                        ) : isLastQuestion ? (
                            <><Check className="w-5 h-5" /> Submit Answers</>
                        ) : (
                            <>Next Question <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
