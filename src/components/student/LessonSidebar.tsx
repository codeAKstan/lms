"use client";

import { Module } from "@/types/models";
import { CheckCircle, PlayCircle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useState } from "react";

interface LessonSidebarProps {
    modules: Module[];
    currentLessonId: string;
    onLessonClick: (lessonId: string) => void;
}

export default function LessonSidebar({
    modules,
    currentLessonId,
    onLessonClick,
}: LessonSidebarProps) {
    const [expandedModules, setExpandedModules] = useState<string[]>(
        modules.map((m) => m.id)
    );

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <div className="h-full bg-white border-r border-muted overflow-y-auto">
            <div className="p-4 border-b border-muted">
                <h3 className="font-semibold text-accent">Course Content</h3>
            </div>

            <div>
                {modules.map((module, index) => {
                    const isExpanded = expandedModules.includes(module.id);
                    const completedLessons = module.lessons.filter(
                        (l) => l.isCompleted
                    ).length;

                    return (
                        <div key={module.id} className="border-b border-muted">
                            {/* Module Header */}
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1 text-left">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-semibold text-accent">
                                            {module.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {completedLessons}/{module.lessons.length} completed
                                        </p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>

                            {/* Lessons */}
                            {isExpanded && (
                                <div className="bg-surface">
                                    {module.lessons.map((lesson) => {
                                        const isActive = lesson.id === currentLessonId;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onLessonClick(lesson.id)}
                                                disabled={!lesson.isFree && !lesson.isCompleted}
                                                className={`w-full px-4 py-2 pl-10 flex items-center justify-between text-left transition-colors ${isActive
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-white"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                    ) : lesson.isFree ? (
                                                        <PlayCircle className="w-4 h-4" />
                                                    ) : (
                                                        <Lock className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm">{lesson.title}</span>
                                                </div>
                                                <span className="text-xs opacity-75">
                                                    {lesson.duration}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
