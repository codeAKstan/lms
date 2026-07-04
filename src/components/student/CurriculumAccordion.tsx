"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, Lock } from "lucide-react";
import { Module } from "@/types/models";

interface CurriculumAccordionProps {
    modules: Module[];
    onPreview?: (lesson: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function CurriculumAccordion({
    modules,
    onPreview
}: CurriculumAccordionProps) {
    const [expandedModules, setExpandedModules] = useState<string[]>([
        modules[0]?.id || "",
    ]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const totalLessons = modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-accent">
                    {modules.length} {modules.length === 1 ? "Module" : "Modules"}
                </h3>
                <span className="text-sm text-muted-foreground">
                    {totalLessons} Lessons
                </span>
            </div>

            {modules.map((module, index) => {
                const isExpanded = expandedModules.includes(module.id);

                return (
                    <div
                        key={module.id}
                        className="border border-muted rounded-lg overflow-hidden"
                    >
                        {/* Module Header */}
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-surface transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 text-left">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    {index + 1}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-accent">{module.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {module.lessons.length}{" "}
                                        {module.lessons.length === 1 ? "lesson" : "lessons"}
                                    </p>
                                </div>
                            </div>
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </button>

                        {/* Module Lessons */}
                        {isExpanded && (
                            <div className="bg-surface">
                                {module.lessons.map((lesson) => {
                                    const canPreview = lesson.isFree &&
                                        (lesson.muxPlaybackId || lesson.videoUrl || (lesson.type === 'video' && lesson.content?.includes('http')));
                                        
                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={() => canPreview && onPreview?.(lesson)}
                                            className={`px-5 py-3 flex items-center justify-between border-t border-muted transition-colors ${
                                                canPreview ? 'hover:bg-green-50 cursor-pointer' : 'hover:bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {canPreview ? (
                                                    <PlayCircle className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {lesson.title}
                                                    </p>
                                                    {canPreview && (
                                                        <span className="text-xs text-primary font-medium hover:underline">
                                                            Click to Preview
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {lesson.duration}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
