"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Check, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { saveQuiz, getQuizForLesson, QuizQuestionDraft, QuizDraft } from "@/actions/quiz";
import { uploadFile, getAllowedTypes, getMaxSize } from "@/lib/upload";

// ─── Defaults ─────────────────────────────────────────────────────────────────
const emptyQuestion = (position: number): QuizQuestionDraft => ({
    question: "",
    type: "MULTIPLE_CHOICE",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    hintText: "",
    hintImage: "",
    points: 5,
    position,
});

// ─── Component ────────────────────────────────────────────────────────────────
export function QuizBuilder({ lessonId }: { lessonId: string }) {
    const [title, setTitle] = useState("Quiz");
    const [description, setDescription] = useState("");
    const [passingScore, setPassingScore] = useState(70);
    const [timeLimit, setTimeLimit] = useState<number | "">("");
    const [questions, setQuestions] = useState<QuizQuestionDraft[]>([emptyQuestion(0)]);
    const [expandedIdx, setExpandedIdx] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingHintIdx, setUploadingHintIdx] = useState<number | null>(null);
    const hintInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Load existing quiz
    useEffect(() => {
        async function load() {
            const quiz = await getQuizForLesson(lessonId);
            if (quiz) {
                setTitle(quiz.title);
                setDescription(quiz.description ?? "");
                setPassingScore(quiz.passingScore);
                setTimeLimit(quiz.timeLimit ?? "");
                if (quiz.questions.length > 0) {
                    setQuestions(quiz.questions.map((q) => ({
                        id: q.id,
                        question: q.question,
                        type: q.type,
                        options: q.options as string[],
                        correctAnswer: q.correctAnswer as string | string[],
                        explanation: q.explanation ?? "",
                        hintText: q.hintText ?? "",
                        hintImage: q.hintImage ?? "",
                        points: q.points,
                        position: q.position,
                    })));
                }
            }
            setIsLoading(false);
        }
        load();
    }, [lessonId]);

    const updateQ = <K extends keyof QuizQuestionDraft>(idx: number, key: K, value: QuizQuestionDraft[K]) => {
        setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [key]: value } : q));
    };

    const addQuestion = () => {
        const newQ = emptyQuestion(questions.length);
        setQuestions((prev) => [...prev, newQ]);
        setExpandedIdx(questions.length);
    };

    const removeQuestion = (idx: number) => {
        if (questions.length === 1) return;
        setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, position: i })));
        setExpandedIdx(Math.max(0, expandedIdx - 1));
    };

    const updateOption = (qIdx: number, oIdx: number, val: string) => {
        const newOptions = [...questions[qIdx].options];
        newOptions[oIdx] = val;
        updateQ(qIdx, "options", newOptions);
    };

    const addOption = (qIdx: number) => {
        updateQ(qIdx, "options", [...questions[qIdx].options, ""]);
    };

    const removeOption = (qIdx: number, oIdx: number) => {
        if (questions[qIdx].options.length <= 2) return;
        const newOptions = questions[qIdx].options.filter((_, i) => i !== oIdx);
        updateQ(qIdx, "options", newOptions);
        // Clear correct answer if it was this option
        const q = questions[qIdx];
        if (q.correctAnswer === q.options[oIdx]) updateQ(qIdx, "correctAnswer", "");
    };

    const handleTypeChange = (idx: number, type: QuizQuestionDraft["type"]) => {
        updateQ(idx, "type", type);
        if (type === "TRUE_FALSE") {
            updateQ(idx, "options", ["True", "False"]);
            updateQ(idx, "correctAnswer", "");
        } else if (type === "MULTI_SELECT") {
            updateQ(idx, "correctAnswer", []);
        } else {
            updateQ(idx, "correctAnswer", "");
        }
    };

    const toggleMultiCorrect = (qIdx: number, option: string) => {
        const prev = (questions[qIdx].correctAnswer as string[]) ?? [];
        const next = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option];
        updateQ(qIdx, "correctAnswer", next);
    };

    const handleHintImageUpload = async (idx: number, file: File) => {
        setUploadingHintIdx(idx);
        try {
            toast.loading("Uploading hint image...", { id: "hint-upload" });
            const result = await uploadFile(file, {
                bucket: "course-assets",
                folder: "quiz-hints",
                allowedTypes: getAllowedTypes("image"),
                maxSize: getMaxSize("image"),
            });
            updateQ(idx, "hintImage", result.url);
            toast.success("Hint image uploaded!", { id: "hint-upload" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed", { id: "hint-upload" });
        } finally {
            setUploadingHintIdx(null);
        }
    };

    const handleSave = async () => {
        // Validate
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) { toast.error(`Question ${i + 1} has no text.`); return; }
            if (q.options.some((o) => !o.trim())) { toast.error(`Question ${i + 1} has empty option(s).`); return; }
            const ca = q.correctAnswer;
            if (q.type === "MULTI_SELECT") {
                if (!Array.isArray(ca) || (ca as string[]).length === 0) { toast.error(`Question ${i + 1}: select at least one correct answer.`); return; }
            } else {
                if (!ca) { toast.error(`Question ${i + 1}: no correct answer selected.`); return; }
            }
        }

        const draft: QuizDraft = { title, description, passingScore, timeLimit: timeLimit === "" ? undefined : Number(timeLimit), questions };
        setIsSaving(true);
        try {
            await saveQuiz(lessonId, draft);
            toast.success("Quiz saved successfully!");
        } catch {
            toast.error("Failed to save quiz.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    return (
        <div className="space-y-5 mt-2">
            {/* Quiz-level settings */}
            <div className="bg-[#f0f9f9] border border-[#006a6a]/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-[#006a6a] uppercase tracking-widest">Quiz Settings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Quiz Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            placeholder="e.g. Module 1 Assessment"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Passing Score (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={passingScore}
                                onChange={(e) => setPassingScore(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Time Limit (min)</label>
                            <input
                                type="number"
                                min={0}
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                placeholder="Unlimited"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
                {questions.map((q, idx) => {
                    const isExpanded = expandedIdx === idx;
                    return (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Question header */}
                            <div
                                className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
                            >
                                <div className="w-6 h-6 rounded-full bg-[#006a6a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                                    {q.question || `Question ${idx + 1}`}
                                </span>
                                <span className="text-xs font-semibold text-gray-400 mr-2">{q.points} pts</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>

                            {/* Question body */}
                            {isExpanded && (
                                <div className="p-4 space-y-4 bg-white">
                                    {/* Question text */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question Text</label>
                                        <textarea
                                            rows={2}
                                            value={q.question}
                                            onChange={(e) => updateQ(idx, "question", e.target.value)}
                                            placeholder="Type your question here..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
                                        />
                                    </div>

                                    {/* Type + Points */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question Type</label>
                                            <select
                                                value={q.type}
                                                onChange={(e) => handleTypeChange(idx, e.target.value as QuizQuestionDraft["type"])}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            >
                                                <option value="MULTIPLE_CHOICE">Single Choice</option>
                                                <option value="TRUE_FALSE">True / False</option>
                                                <option value="MULTI_SELECT">Multi Select</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Points</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={q.points}
                                                onChange={(e) => updateQ(idx, "points", Number(e.target.value))}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Answer Options &nbsp;<span className="text-[#006a6a] normal-case font-normal">(click ✓ to mark correct)</span>
                                        </label>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => {
                                                const isCorrect = q.type === "MULTI_SELECT"
                                                    ? (q.correctAnswer as string[])?.includes(opt)
                                                    : q.correctAnswer === opt;
                                                return (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (q.type === "MULTI_SELECT") toggleMultiCorrect(idx, opt);
                                                                else updateQ(idx, "correctAnswer", opt);
                                                            }}
                                                            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${isCorrect
                                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                                : "border-gray-300 hover:border-emerald-400"
                                                                }`}
                                                        >
                                                            {isCorrect && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                                                            placeholder={`Option ${oIdx + 1}`}
                                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        {q.type !== "TRUE_FALSE" && (
                                                            <button
                                                                onClick={() => removeOption(idx, oIdx)}
                                                                className="text-gray-300 hover:text-red-400 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.type !== "TRUE_FALSE" && (
                                            <button
                                                onClick={() => addOption(idx)}
                                                className="mt-2 text-xs font-semibold text-[#006a6a] hover:text-[#005555] flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add option
                                            </button>
                                        )}
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Explanation (shown after submission)</label>
                                        <textarea
                                            rows={2}
                                            value={q.explanation}
                                            onChange={(e) => updateQ(idx, "explanation", e.target.value)}
                                            placeholder="Explain why this is the correct answer..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
                                        />
                                    </div>

                                    {/* Hint */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Hint / Tip (optional)</label>
                                        <textarea
                                            rows={2}
                                            value={q.hintText}
                                            onChange={(e) => updateQ(idx, "hintText", e.target.value)}
                                            placeholder="e.g. Consider the relationship between temperature and efficiency..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
                                        />
                                        {/* Hint image */}
                                        <div className="flex items-center gap-3">
                                            {q.hintImage ? (
                                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-100 flex-1">
                                                    <ImageIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate flex-1 text-xs">Hint image uploaded</span>
                                                    <button onClick={() => updateQ(idx, "hintImage", "")} className="text-blue-400 hover:text-red-500">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => hintInputRefs.current[idx]?.click()}
                                                    disabled={uploadingHintIdx === idx}
                                                    className="flex items-center gap-2 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 px-3 py-2 rounded-lg hover:border-gray-400 transition-colors"
                                                >
                                                    {uploadingHintIdx === idx
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <ImageIcon className="w-3.5 h-3.5" />}
                                                    Add hint image
                                                </button>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={(el) => { hintInputRefs.current[idx] = el; }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleHintImageUpload(idx, file);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add question */}
            <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-[#006a6a] hover:text-[#006a6a] hover:bg-[#006a6a]/5 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Question
            </button>

            {/* Save */}
            <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                    {questions.length} question{questions.length !== 1 ? "s" : ""} · Total {questions.reduce((s, q) => s + q.points, 0)} pts
                </p>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#006a6a] text-white text-sm font-semibold rounded-xl hover:bg-[#005555] transition-colors disabled:opacity-60"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Quiz
                </button>
            </div>
        </div>
    );
}
