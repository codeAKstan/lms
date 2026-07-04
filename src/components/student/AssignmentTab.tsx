"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Assignment, Submission } from "@prisma/client";

interface AssignmentTabProps {
    lessonId: string;
    assignment: Assignment & { submissions: Submission[] };
}

export default function AssignmentTab({ assignment }: AssignmentTabProps) {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<Submission | null>(
        assignment?.submissions?.find((s) => s.userId === user?.id) || null
    );

    // const supabase = createClientComponentClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file && !submission) {
            toast.error("Please select a file to upload");
            return;
        }

        setIsSubmitting(true);
        try {
            let fileUrl = submission?.fileUrl;

            // 1. Upload File (if new file selected)
            if (file) {
                const fileName = `${user?.id}/${Date.now()}_${file.name}`;
                const { error } = await supabase
                    .storage
                    .from('course-content') // Re-using existing bucket for simplicity
                    .upload(fileName, file);

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('course-content')
                    .getPublicUrl(fileName);

                fileUrl = publicUrl;
            }

            // 2. Save Submission to DB
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    fileUrl,
                    studentNotes: notes,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit assignment");

            const newSubmission = await res.json();
            setSubmission(newSubmission);
            toast.success("Assignment submitted successfully!");
            setFile(null);
        } catch (error: unknown) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!assignment) {
        return <div className="text-gray-500 italic">No assignment for this lesson.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Assignment Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Due Date"}</p>
                    </div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                        {assignment.maxScore} Points
                    </span>
                </div>
                <div className="prose prose-sm text-gray-600 mb-6">
                    {assignment.description}
                </div>
            </div>

            {/* Submission Status */}
            {submission ? (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <div>
                            <h4 className="font-bold text-emerald-900">Submitted</h4>
                            <p className="text-xs text-emerald-700">
                                {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-emerald-100 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <a href={submission.fileUrl} target="_blank" className="text-sm text-emerald-600 hover:underline font-medium truncate max-w-[200px]">
                                View Submitted File
                            </a>
                        </div>
                        {submission.grade !== null && (
                            <span className="font-bold text-lg">
                                {submission.grade} / {assignment.maxScore}
                            </span>
                        )}
                    </div>

                    {submission.grade === null && (
                        <p className="text-sm text-emerald-700 italic">
                            Pending review by instructor.
                        </p>
                    )}

                    {submission.feedback && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                            <h5 className="font-semibold text-sm text-emerald-900 mb-2">Instructor Feedback:</h5>
                            <p className="text-sm text-emerald-800 bg-emerald-100/50 p-3 rounded">
                                {submission.feedback}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4">Submit Your Work</h4>

                    <div className="space-y-4">
                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                rows={3}
                                placeholder="Add any comments or notes for the instructor..."
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">
                                    {file ? file.name : "Click to upload or drag and drop"}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">PDF, DOCX, ZIP (Max 10MB)</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !file}
                            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                "Submit Assignment"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
