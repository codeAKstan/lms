"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Menu, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import LessonSidebar from "@/components/student/LessonSidebar";
import VideoPlayer from "@/components/student/VideoPlayer";
import QuizView from "@/components/student/QuizView";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import ForumView from "@/components/student/ForumView";

// Define Types (matching what we expect from API)
interface Lesson {
    id: string;
    title: string;
    duration: string;
    isFree: boolean;
    position: number;
    content?: string;
    videoUrl?: string;
    muxPlaybackId?: string;
    isCompleted?: boolean;
    quizzes?: { id: string; title: string; passingScore: number }[];
}

interface Module {
    id: string;
    title: string;
    position: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: any[];
}

const fetcher = (url: string, token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

export default function CoursePlayerPage() {
    const { courseId } = useParams() as { courseId: string };
    const { session } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "resources" | "notes" | "quiz" | "discussion">("overview");
    const [currentLessonId, setCurrentLessonId] = useState<string>("");

    // 1. Fetch Course Data (Details + Modules + Lessons)
    // We reuse the single course ID endpoint which returns full structure
    const { data: course, error: courseError } = useSWR<Course>(
        session?.access_token ? `/api/courses/${courseId}` : null,
        (url: string) => fetcher(url, session!.access_token)
    );

    // 2. Fetch User Progress
    const { data: progressData, mutate: mutateProgress } = useSWR(
        session?.access_token ? `/api/courses/${courseId}/progress` : null,
        (url) => fetcher(url, session!.access_token)
    );

    // 3. Merge Progress into Curriculum
    const curriculum = useMemo(() => {
        if (!course || !course.modules) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modules: Module[] = course.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lessons: m.lessons.map((l: any) => ({
                id: l.id,
                title: l.title,
                duration: `${Math.round(l.duration / 60)} min`, // convert seconds
                isFree: l.isFree,
                position: l.position,
                content: l.content,
                videoUrl: l.videoUrl,
                muxPlaybackId: l.muxPlaybackId,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isCompleted: progressData?.some((p: any) => p.lessonId === l.id && p.completed)
            })).sort((a: Lesson, b: Lesson) => a.position - b.position)
        })).sort((a: Module, b: Module) => a.position - b.position || 0);

        return { modules };
    }, [course, progressData]);

    // Initialize current lesson if not set
    useEffect(() => {
        if (curriculum && !currentLessonId && curriculum.modules.length > 0) {
            // Default to first lesson
            // Or try to find first uncompleted lesson?
            const firstLesson = curriculum.modules[0].lessons[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (firstLesson) setCurrentLessonId(firstLesson.id);
        }
    }, [curriculum, currentLessonId]);

    // Helper functions
    const allLessons = curriculum ? curriculum.modules.flatMap((m) => m.lessons) : [];
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    const currentLesson = allLessons[currentIndex];

    // Progress calculation
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter(l => l.isCompleted).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const handleLessonComplete = async () => {
        if (!currentLesson) return;

        // Optimistic update?
        // For now, simple API call then revalidate
        try {
            await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    lessonId: currentLesson.id,
                    completed: true
                })
            });
            mutateProgress(); // Refresh progress
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    if (courseError) return <div className="p-10 text-center">Failed to load course.</div>;
    if (!course || !curriculum) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allLessons.length - 1;

    return (
        <div className="h-screen flex flex-col bg-surface">
            {/* Header */}
            <div className="bg-white border-b border-muted px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-semibold text-accent line-clamp-1">
                            {course.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Progress: {progressPercent}%</span>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
                <Link
                    href="/dashboard/courses"
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </Link>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                {isSidebarOpen && (
                    <div className="w-80 flex-shrink-0 border-r border-muted bg-white h-full overflow-y-auto">
                        <LessonSidebar
                            modules={curriculum.modules}
                            currentLessonId={currentLessonId}
                            onLessonClick={setCurrentLessonId}
                        />
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        {/* Video Player */}
                        {currentLesson?.muxPlaybackId || currentLesson?.videoUrl ? (
                            <VideoPlayer
                                videoUrl={currentLesson.videoUrl}
                                muxPlaybackId={currentLesson.muxPlaybackId}
                                onComplete={handleLessonComplete}
                            />
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No video available for this lesson.</p>
                            </div>
                        )}

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between border-b border-muted pb-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentLessonId(allLessons[currentIndex - 1].id)}
                                    disabled={!hasPrevious}
                                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentLessonId(allLessons[currentIndex + 1].id)}
                                    disabled={!hasNext}
                                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleLessonComplete}
                                disabled={currentLesson?.isCompleted}
                                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${currentLesson?.isCompleted
                                    ? "bg-success/10 text-success cursor-default"
                                    : "bg-primary text-white hover:bg-primary/90"
                                    }`}
                            >
                                {currentLesson?.isCompleted ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" /> Completed
                                    </>
                                ) : (
                                    "Mark as Complete"
                                )}
                            </button>
                        </div>

                        {/* Tabs for Content */}
                        <div>
                            <div className="border-b border-muted flex gap-6 mb-4">
                                <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                <TabButton label="Notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                                <TabButton label="Discussion" active={activeTab === 'discussion'} onClick={() => setActiveTab('discussion')} />
                                {currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
                                    <TabButton label={`Quiz (${currentLesson.quizzes.length})`} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
                                )}
                            </div>

                            <div className="min-h-[200px]">
                                {activeTab === 'overview' && (
                                    <div className="prose max-w-none">
                                        <h2 className="text-2xl font-bold mb-4">{currentLesson?.title}</h2>
                                        <p className="text-muted-foreground">
                                            {currentLesson?.content || "No content available for this lesson."}
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'quiz' && currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
                                    <div className="space-y-4">
                                        {currentLesson.quizzes.map(q => (
                                            <QuizView
                                                key={q.id}
                                                quizId={q.id}
                                                onComplete={() => {
                                                    handleLessonComplete();
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'notes' && (
                                    <textarea
                                        className="w-full h-40 border border-muted rounded-lg p-4 resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="Type your notes here..."
                                    />
                                )}
                                {activeTab === 'discussion' && (
                                    <ForumView courseId={courseId} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
        >
            {label}
        </button>
    )
}
