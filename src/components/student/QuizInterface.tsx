"use client";

import { useState, useEffect, useCallback } from "react";
import { Quiz, QuizQuestion } from "@/types/models";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

interface QuizInterfaceProps {
    quiz: Quiz;
    onComplete: (score: number, passed: boolean) => void;
}

export default function QuizInterface({ quiz, onComplete }: QuizInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(
        quiz.timeLimit ? quiz.timeLimit * 60 : null
    ); // convert to seconds

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // Timer
    const handleSubmit = useCallback(() => {
        // Calculate score
        let correct = 0;
        quiz.questions.forEach((q) => {
            const userAnswer = answers[q.id];
            if (q.type === "multi-select") {
                const correctArray = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.sort()
                    : [];
                const userArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                if (JSON.stringify(correctArray) === JSON.stringify(userArray)) {
                    correct++;
                }
            } else {
                if (userAnswer === q.correctAnswer) {
                    correct++;
                }
            }
        });

        const percentage = Math.round((correct / totalQuestions) * 100);
        setScore(percentage);
        setIsSubmitted(true);
        onComplete(percentage, percentage >= quiz.passingScore);
    }, [answers, quiz, totalQuestions, onComplete]);
    useEffect(() => {
        if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeRemaining === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeRemaining, isSubmitted, handleSubmit]);

    const handleAnswerChange = (questionId: string, answer: string | string[]) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };



    const isQuestionAnswered = (questionId: string) => {
        return questionId in answers && answers[questionId] !== undefined;
    };

    const allQuestionsAnswered = quiz.questions.every((q) =>
        isQuestionAnswered(q.id)
    );

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isSubmitted) {
        return <QuizResults quiz={quiz} score={score} answers={answers} />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-muted">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-accent">{quiz.title}</h2>
                    {timeRemaining !== null && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                            <span
                                className={`font-semibold ${timeRemaining < 60 ? "text-error" : "text-foreground"
                                    }`}
                            >
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                        <span className="font-medium text-accent">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-xl border border-muted">
                <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestion.id]}
                    onAnswerChange={(answer) =>
                        handleAnswerChange(currentQuestion.id, answer)
                    }
                />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 text-sm font-medium  text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        Next Question
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered}
                        className="px-8 py-3 bg-success text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
}

function QuestionCard({
    question,
    selectedAnswer,
    onAnswerChange,
}: {
    question: QuizQuestion;
    selectedAnswer: string | string[] | undefined;
    onAnswerChange: (answer: string | string[]) => void;
}) {
    const handleMultiSelectToggle = (option: string) => {
        const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
        if (currentAnswers.includes(option)) {
            onAnswerChange(currentAnswers.filter((a) => a !== option));
        } else {
            onAnswerChange([...currentAnswers, option]);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-accent">{question.question}</h3>

            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected =
                        question.type === "multi-select"
                            ? Array.isArray(selectedAnswer) && selectedAnswer.includes(option)
                            : selectedAnswer === option;

                    return (
                        <button
                            key={index}
                            onClick={() =>
                                question.type === "multi-select"
                                    ? handleMultiSelectToggle(option)
                                    : onAnswerChange(option)
                            }
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${isSelected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50 hover:bg-surface"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className="font-medium text-foreground">{option}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {question.type === "multi-select" && (
                <p className="text-sm text-muted-foreground italic">
                    Select all that apply
                </p>
            )}
        </div>
    );
}

function QuizResults({
    quiz,
    score,
    answers,
}: {
    quiz: Quiz;
    score: number;
    answers: Record<string, string | string[]>;
}) {
    const passed = score >= quiz.passingScore;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Score Card */}
            <div
                className={`p-8 rounded-xl text-center ${passed
                    ? "bg-success/10 border-2 border-success"
                    : "bg-error/10 border-2 border-error"
                    }`}
            >
                {passed ? (
                    <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                ) : (
                    <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
                )}
                <h2 className="text-3xl font-bold text-accent mb-2">
                    {passed ? "Congratulations!" : "Keep Trying!"}
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                    You scored <span className="font-bold text-accent">{score}%</span>
                </p>
                <p className="text-sm text-muted-foreground">
                    Passing score: {quiz.passingScore}%
                </p>
            </div>

            {/* Answers Review */}
            <div className="bg-white p-6 rounded-xl border border-muted space-y-6">
                <h3 className="text-xl font-bold text-accent">Review Your Answers</h3>

                {quiz.questions.map((q, index) => {
                    const userAnswer = answers[q.id];
                    let isCorrect = false;

                    if (q.type === "multi-select") {
                        const correctArray = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.sort()
                            : [];
                        const userArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                        isCorrect = JSON.stringify(correctArray) === JSON.stringify(userArray);
                    } else {
                        isCorrect = userAnswer === q.correctAnswer;
                    }

                    return (
                        <div
                            key={q.id}
                            className={`p-4 rounded-lg border-2 ${isCorrect
                                ? "border-success/30 bg-success/5"
                                : "border-error/30 bg-error/5"
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                {isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-success mt-1" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-error mt-1" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-accent mb-2">
                                        Question {index + 1}: {q.question}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Your answer:{" "}
                                        <span className="font-medium text-foreground">
                                            {Array.isArray(userAnswer)
                                                ? userAnswer.join(", ")
                                                : userAnswer || "Not answered"}
                                        </span>
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm text-muted-foreground">
                                            Correct answer:{" "}
                                            <span className="font-medium text-success">
                                                {Array.isArray(q.correctAnswer)
                                                    ? q.correctAnswer.join(", ")
                                                    : q.correctAnswer}
                                            </span>
                                        </p>
                                    )}
                                    {q.explanation && (
                                        <p className="text-sm text-muted-foreground mt-2 italic">
                                            {q.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                    Retake Quiz
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    Continue Learning
                </button>
            </div>
        </div>
    );
}
