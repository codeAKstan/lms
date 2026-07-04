"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, FileText, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Minimal types for props
type Assignment = {
    id: string;
    title: string;
    description: string;
    maxScore: number;
    dueDate: Date | null;
};

type Lesson = {
    id: string;
    title: string;
    assignments: Assignment[];
};

type Module = {
    id: string;
    title: string;
    lessons: Lesson[];
};

type Course = {
    id: string;
    modules: Module[];
};

export default function AssignmentManagerClient({ course }: { course: Course }) {
    const router = useRouter();
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        maxScore: 100,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditClick = (lesson: Lesson) => {
        setEditingLessonId(lesson.id);
        const existing = lesson.assignments[0];
        if (existing) {
            setFormData({
                title: existing.title,
                description: existing.description,
                maxScore: existing.maxScore,
            });
        } else {
            setFormData({
                title: `Assignment for ${lesson.title}`,
                description: "",
                maxScore: 100,
            });
        }
    };

    const handleSave = async (lessonId: string) => {
        if (!formData.title) return toast.error("Title is required");

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    lessonId,
                }),
            });

            if (!res.ok) throw new Error("Failed to save assignment");

            toast.success("Assignment saved!");
            setEditingLessonId(null);
            router.refresh(); // Reload to see changes
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {course.modules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">
                        {module.title}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {module.lessons.map((lesson) => {
                            const hasAssignment = lesson.assignments && lesson.assignments.length > 0;
                            const assignment = hasAssignment ? lesson.assignments[0] : null;

                            if (editingLessonId === lesson.id) {
                                return (
                                    <div key={lesson.id} className="p-6 bg-blue-50/50 animate-in fade-in">
                                        <h4 className="font-semibold text-gray-900 mb-4">
                                            {hasAssignment ? "Edit Assignment" : "Add Assignment"}
                                        </h4>
                                        <div className="space-y-4 max-w-xl">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions / Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                                <input
                                                    type="number"
                                                    value={formData.maxScore}
                                                    onChange={e => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => handleSave(lesson.id)}
                                                    disabled={isSubmitting}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Assignment"}
                                                </button>
                                                <button
                                                    onClick={() => setEditingLessonId(null)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                            {hasAssignment ? (
                                                <div className="flex items-center gap-2 text-sm text-emerald-600 mt-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Assignment Active: {assignment?.title} ({assignment?.maxScore} pts)</span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 mt-1">No assignment</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEditClick(lesson)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${hasAssignment
                                            ? "border-gray-200 text-gray-700 hover:bg-gray-100"
                                            : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                            }`}
                                    >
                                        {hasAssignment ? (
                                            <div className="flex items-center gap-2">
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" /> Add Assignment
                                            </div>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
