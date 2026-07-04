"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";

type Course = {
    id: string;
    title: string;
    published: boolean;
};

export default function LearningPathCourseManager({
    pathId,
    availableCourses,
    existingCourses,
    onAddCourse,
    onRemoveCourse
}: {
    pathId: string;
    availableCourses: Course[];
    existingCourses: Course[];
    onAddCourse: (pathId: string, courseId: string) => Promise<void>;
    onRemoveCourse: (pathId: string, courseId: string) => Promise<void>;
}) {
    const [isPending, startTransition] = useTransition();
    const [selectedCourse, setSelectedCourse] = useState("");

    const handleAdd = () => {
        if (!selectedCourse) return;
        startTransition(async () => {
            await onAddCourse(pathId, selectedCourse);
            setSelectedCourse("");
        });
    };

    const handleRemove = (courseId: string) => {
        startTransition(async () => {
            await onRemoveCourse(pathId, courseId);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <select
                    className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={isPending || availableCourses.length === 0}
                >
                    <option value="">Select a course to add...</option>
                    {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title} {!course.published ? "(Draft)" : ""}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAdd}
                    disabled={!selectedCourse || isPending}
                    className="bg-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[120px]"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 text-sm">
                    {existingCourses.length} Assigned Course{existingCourses.length !== 1 && 's'}
                </div>
                <div className="divide-y divide-gray-100">
                    {existingCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                            <div>
                                <h4 className="font-medium text-gray-900">{course.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                    {course.published ? (
                                        <span className="text-success">Published</span>
                                    ) : (
                                        "Draft"
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemove(course.id)}
                                disabled={isPending}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                                title="Remove course"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {existingCourses.length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No courses are assigned to this learning path yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
