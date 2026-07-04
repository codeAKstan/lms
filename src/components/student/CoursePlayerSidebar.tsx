"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle, MonitorPlay } from "lucide-react";

interface Lesson {
    id: string;
    title: string;
    duration: string;
    isFree?: boolean;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface CoursePlayerSidebarProps {
    modules: Module[];
    activeLessonId: string;
    completedLessonIds: string[];
    onSelectLesson: (lessonId: string) => void;
    title: string;
    progress: number;
}

export default function CoursePlayerSidebar({
    modules,
    activeLessonId,
    completedLessonIds,
    onSelectLesson,
    title,
    progress
}: CoursePlayerSidebarProps) {
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const activeModuleId = modules.find(m => m.lessons.some(l => l.id === activeLessonId))?.id;

    // Auto-expand module containing active lesson
    useEffect(() => {
        if (activeModuleId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpandedModules(prev => {
                if (!prev.includes(activeModuleId)) {
                    return [...prev, activeModuleId];
                }
                return prev;
            });
        }

    }, [activeModuleId]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 w-full md:w-80 lg:w-96">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 line-clamp-2 mb-2">{title}</h2>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{progress}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Curriculum */}
            <div className="flex-1 overflow-y-auto">
                {modules.map((mod, index) => {
                    const isExpanded = expandedModules.includes(mod.id);
                    const isActiveModule = mod.lessons.some(l => l.id === activeLessonId);

                    return (
                        <div key={mod.id} className="border-b border-gray-100">
                            <button
                                onClick={() => toggleModule(mod.id)}
                                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${isActiveModule ? "bg-gray-50" : ""
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                                        Module {index + 1}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">{mod.title}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="bg-gray-50/50 pb-2">
                                    {mod.lessons.map((lesson, i) => {
                                        const isActive = lesson.id === activeLessonId;
                                        const isCompleted = completedLessonIds.includes(lesson.id);

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson.id)}
                                                className={`w-full px-4 py-2 flex items-start gap-3 hover:bg-gray-100 transition-colors text-left group relative ${isActive ? "bg-emerald-50 hover:bg-emerald-50 border-r-2 border-emerald-500" : ""
                                                    }`}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {isActive ? (
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                            <PlayCircle className="w-3 h-3 fill-current" />
                                                        </div>
                                                    ) : isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-gray-400 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium transition-colors ${isActive ? "text-emerald-900" : isCompleted ? "text-gray-700" : "text-gray-600"
                                                        }`}>
                                                        {i + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <MonitorPlay className="w-3 h-3" /> {lesson.duration}
                                                        </span>
                                                    </div>
                                                </div>
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
