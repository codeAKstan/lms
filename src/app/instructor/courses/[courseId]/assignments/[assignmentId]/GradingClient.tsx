"use client";

import { useState } from "react";
import { X, Download } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Minimal types
type User = {
    name: string | null;
    email: string | null;
    avatar: string | null;
};

type Submission = {
    id: string;
    fileUrl: string;
    studentNotes: string | null;
    submittedAt: Date;
    grade: number | null;
    feedback: string | null;
    user: User;
};

type Assignment = {
    id: string;
    title: string;
    maxScore: number;
    submissions: Submission[];
};

export default function GradingClient({ assignment }: { assignment: Assignment }) {
    const router = useRouter();
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number | string>("");
    const [feedback, setFeedback] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Filter into Pending/Graded
    const pending = assignment.submissions.filter(s => s.grade === null);
    const graded = assignment.submissions.filter(s => s.grade !== null);

    const openGradeModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGrade(submission.grade !== null ? submission.grade : "");
        setFeedback(submission.feedback || "");
    };

    const handleSaveGrade = async () => {
        if (!selectedSubmission) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/submissions/${selectedSubmission.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    grade: Number(grade),
                    feedback,
                }),
            });

            if (!res.ok) throw new Error("Failed to save grade");

            toast.success("Grade saved successfully");
            setSelectedSubmission(null);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Error saving grade");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Cards could go here */}

            {/* Main Content: Two Columns if Pending exists, else just one */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending Submissions */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                        Pending Review ({pending.length})
                    </h3>
                    {pending.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No pending submissions.</p>
                    ) : (
                        pending.map(sub => (
                            <SubmissionCard
                                key={sub.id}
                                submission={sub}
                                onClick={() => openGradeModal(sub)}
                            />
                        ))
                    )}
                </div>

                {/* Graded Submissions */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                        Graded ({graded.length})
                    </h3>
                    {graded.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No graded submissions yet.</p>
                    ) : (
                        graded.map(sub => (
                            <SubmissionCard
                                key={sub.id}
                                submission={sub}
                                onClick={() => openGradeModal(sub)}
                                isGraded
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                Grade Submission
                            </h3>
                            <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                    {selectedSubmission.user.avatar ? (
                                        <Image src={selectedSubmission.user.avatar} alt="Avatar" width={48} height={48} className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                            {selectedSubmission.user.name?.[0] || "S"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{selectedSubmission.user.name || "Unknown Student"}</h4>
                                    <p className="text-sm text-gray-500">{selectedSubmission.user.email}</p>
                                </div>
                            </div>

                            {/* Submission Content */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Submitted File:</span>
                                    <a
                                        href={selectedSubmission.fileUrl}
                                        target="_blank"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                                    >
                                        <Download className="w-4 h-4" /> Download / View
                                    </a>
                                </div>
                                {selectedSubmission.studentNotes && (
                                    <div className="pt-2 border-t border-gray-200 mt-2">
                                        <span className="text-sm font-medium text-gray-500 block mb-1">Student Notes:</span>
                                        <p className="text-sm text-gray-700 italic">&quot;{selectedSubmission.studentNotes}&quot;</p>
                                    </div>
                                )}
                            </div>

                            {/* Grading Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Grade (Max: {assignment.maxScore})</label>
                                    <input
                                        type="number"
                                        max={assignment.maxScore}
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Enter score"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Feedback</label>
                                    <textarea
                                        rows={4}
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Provide feedback to the student..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGrade}
                                disabled={isSaving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                            >
                                {isSaving ? "Saving..." : "Save Evaluation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SubmissionCard({ submission, onClick, isGraded = false }: { submission: Submission, onClick: () => void, isGraded?: boolean }) {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${isGraded ? "bg-white border-gray-200" : "bg-white border-l-4 border-l-blue-500 border-y-gray-200 border-r-gray-200"
                }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {submission.user.name?.[0] || "?"}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{submission.user.name || submission.user.email}</h4>
                        <p className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {isGraded ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
                        {submission.grade} Pts
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        Needs Grading
                    </span>
                )}
            </div>
        </div>
    );
}
