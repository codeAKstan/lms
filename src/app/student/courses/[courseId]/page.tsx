"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import VideoPlayer from "@/components/student/VideoPlayer";
import { Loader2, ChevronLeft, ChevronRight, Menu, X, HelpCircle } from "lucide-react";
import CoursePlayerSidebar from "@/components/student/CoursePlayerSidebar";
import Link from "next/link";
import { toast } from "sonner";
import DiscussionTab from "@/components/student/DiscussionTab";
import AssignmentTab from "@/components/student/AssignmentTab";
import ReviewDialog from "@/components/student/ReviewDialog";

interface Quiz {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface Assignment {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string | null;
    muxPlaybackId?: string | null;
    type?: string | null;
    content?: string | null;
    quizzes?: Quiz[];
    assignments?: Assignment[];
}

const fetcher = (url: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { headers }).then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
    });
};

export default function CoursePlayerPage() {
    const params = useParams();
    const courseId = params?.courseId as string;

    const searchParams = useSearchParams();
    const initialLessonId = searchParams?.get("lesson");

    const { user, session } = useAuth();
    const router = useRouter();

    const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [certificateId, setCertificateId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"content" | "discussion" | "assignment">("content");

    // 1. Fetch Course Data
    const { data: course, isLoading: courseLoading } = useSWR(
        session?.access_token ? `/api/courses/${courseId}` : null,
        (url) => fetcher(url, session?.access_token)
    );

    // 2. Fetch Enrollment (Keep for other metadata if needed, or fallback)
    const { data: enrollment, isLoading: enrollLoading } = useSWR(
        session?.access_token ? `/api/enrollments?courseId=${courseId}` : null,
        (url) => fetcher(url, session?.access_token)
    );

    // 3. Fetch Detailed Progress (New API)
    const { data: progressData, mutate: mutateProgress } = useSWR(
        session?.access_token ? `/api/courses/${courseId}/progress` : null,
        (url) => fetcher(url, session?.access_token)
    );

    const currentEnrollment = Array.isArray(enrollment)
        ? enrollment.find((e: { courseId: string }) => e.courseId === courseId)
        : enrollment;

    // Derived state
    const completedLessonIds = progressData?.completedLessons || [];

    useEffect(() => {
        if (!enrollLoading && !currentEnrollment && enrollment) {
            toast.error("You are not enrolled in this course");
            router.push(`/courses/${courseId}`);
        }
    }, [enrollLoading, enrollment, currentEnrollment, courseId, router]);

    // Set initial active lesson
    useEffect(() => {
        if (course && course.modules && course.modules.length > 0 && !activeLessonId) {
            const firstLesson = course.modules[0].lessons[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (firstLesson) setActiveLessonId(firstLesson.id);
        }
    }, [course, activeLessonId]);

    // Update URL
    useEffect(() => {
        if (activeLessonId) {
            const url = new URL(window.location.href);
            url.searchParams.set("lesson", activeLessonId);
            window.history.replaceState({}, "", url.toString());
        }
    }, [activeLessonId]);


    if (courseLoading || enrollLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!course) return <div className="p-8 text-center text-gray-500">Course not found</div>;

    // Find active lesson details using functional approach for proper TypeScript inference
    const findActiveLessonData = (): {
        lesson: Lesson;
        moduleIndex: number;
        lessonIndex: number
    } | null => {
        if (!course.modules || !activeLessonId) return null;

        for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
            const mod = course.modules[mIdx];
            if (!mod.lessons) continue;

            for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
                const lesson = mod.lessons[lIdx];
                if (lesson.id === activeLessonId) {
                    return {
                        lesson: lesson as Lesson,
                        moduleIndex: mIdx,
                        lessonIndex: lIdx
                    };
                }
            }
        }
        return null;
    };

    const lessonData = findActiveLessonData();
    const activeLesson = lessonData?.lesson ?? null;
    const activeModuleIndex = lessonData?.moduleIndex ?? -1;
    const activeLessonIndex = lessonData?.lessonIndex ?? -1;

    // Navigation logic
    const handleNextLesson = async () => {
        if (activeModuleIndex === -1) return;

        const currentModule = course.modules[activeModuleIndex];
        if (activeLessonIndex < currentModule.lessons.length - 1) {
            setActiveLessonId(currentModule.lessons[activeLessonIndex + 1].id);
        } else if (activeModuleIndex < course.modules.length - 1) {
            const nextModule = course.modules[activeModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
                setActiveLessonId(nextModule.lessons[0].id);
            }
        } else {
            toast.success("Congratulations! You've reached the end of the course.");

            try {
                const res = await fetch('/api/certificates/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseId: course.id,
                        userId: user?.id,
                        courseName: course.title,
                        studentName: user?.user_metadata?.full_name || user?.email
                    })
                });
                const data = await res.json();
                if (data.certificateId) {
                    setCertificateId(data.certificateId);
                    toast.success("Certificate generated!");
                }
            } catch (err) {
                console.error("Cert generation failed", err);
            }
        }
    };

    const handlePrevLesson = () => {
        if (activeModuleIndex === -1) return;
        const currentModule = course.modules[activeModuleIndex];
        if (activeLessonIndex > 0) {
            setActiveLessonId(currentModule.lessons[activeLessonIndex - 1].id);
        } else if (activeModuleIndex > 0) {
            const prevModule = course.modules[activeModuleIndex - 1];
            if (prevModule.lessons.length > 0) {
                setActiveLessonId(prevModule.lessons[prevModule.lessons.length - 1].id);
            }
        }
    };

    const handleMarkComplete = async () => {
        if (activeLessonId && !completedLessonIds.includes(activeLessonId)) {


            // Optimistic update
            const newCompletedIds = [...completedLessonIds, activeLessonId];

            // Mutate local cache immediately
            await mutateProgress({
                ...progressData,
                completedLessons: newCompletedIds
            }, { revalidate: false });

            try {
                // Save to DB
                await fetch(`/api/courses/${courseId}/progress`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonId: activeLessonId,
                        completed: true
                    })
                });

                toast.success("Lesson marked as complete");

                // Re-fetch progress to ensure sync
                mutateProgress();

                handleNextLesson();
            } catch (error) {
                console.error("Failed to save progress", error);
                toast.error("Failed to save progress");
                // Rollback if needed by triggering revalidation
                mutateProgress();
            }
        }
    };

    // Wrap onSelectLesson to auto-close sidebar on mobile
    const handleSelectLesson = (lessonId: string) => {
        setActiveLessonId(lessonId);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full border-r border-gray-200 bg-white z-20 shadow-sm relative w-80 lg:w-96 flex-shrink-0">
                {course && (
                    <CoursePlayerSidebar
                        title={course.title}
                        modules={course.modules || []}
                        activeLessonId={activeLessonId || ""}
                        completedLessonIds={completedLessonIds}
                        onSelectLesson={handleSelectLesson}
                        progress={progressData?.progress || currentEnrollment?.progressPercent || 0}
                    />
                )}
            </div>

            {/* Mobile Sidebar Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 md:hidden ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {course && (
                    <CoursePlayerSidebar
                        title={course.title}
                        modules={course.modules || []}
                        activeLessonId={activeLessonId || ""}
                        completedLessonIds={completedLessonIds}
                        onSelectLesson={handleSelectLesson}
                        progress={progressData?.progress || currentEnrollment?.progressPercent || 0}
                    />
                )}
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        {/* Mobile: Sidebar toggle */}
                        <button
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle lesson menu"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link href="/student/courses" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-semibold text-gray-900 line-clamp-1 text-sm md:text-base">{activeLesson?.title || course.title}</h1>
                    </div>
                    {/* Review Button */}
                    <div className="hidden md:block">
                        <ReviewDialog courseId={course.id} onSuccess={() => {}} />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
                    {activeLesson ? (
                        <>
                            {activeLesson.quizzes && activeLesson.quizzes.length > 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in duration-500">
                                    <div className="w-20 h-20 rounded-full bg-[#006a6a]/10 flex items-center justify-center">
                                        <HelpCircle className="w-10 h-10 text-[#006a6a]" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                                        <p className="text-gray-500 max-w-sm">
                                            This lesson includes a quiz assessment. Start when you are ready — your progress will be saved automatically.
                                        </p>
                                    </div>
                                    <Link
                                        href={`/student/courses/${courseId}/quiz/${activeLesson.id}`}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#006a6a] text-white font-bold rounded-2xl hover:bg-[#005555] transition-all shadow-lg shadow-[#006a6a]/20 hover:-translate-y-0.5"
                                    >
                                        Start Quiz <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    {/* Video Player */}
                                    {activeLesson.muxPlaybackId || activeLesson.videoUrl || activeLesson.type === 'video' ? (
                                        <div className="mb-6">
                                            <div className="mb-6">
                                                <VideoPlayer
                                                    videoUrl={activeLesson.videoUrl || ""}
                                                    muxPlaybackId={activeLesson.muxPlaybackId}
                                                    onProgress={() => {
                                                        // Video progress tracking handled by onComplete
                                                    }}
                                                    onComplete={() => {
                                                        if (!completedLessonIds.includes(activeLesson.id)) {
                                                            handleMarkComplete();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Tabs */}
                                    <div className="border-b border-gray-200 mb-6">
                                        <div className="flex gap-8">
                                            <button
                                                onClick={() => setActiveTab("content")}
                                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "content"
                                                    ? "border-emerald-600 text-emerald-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                Lesson Content
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("discussion")}
                                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "discussion"
                                                    ? "border-emerald-600 text-emerald-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                Discussion
                                            </button>
                                            {activeLesson.assignments && activeLesson.assignments.length > 0 && (
                                                <button
                                                    onClick={() => setActiveTab("assignment")}
                                                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "assignment"
                                                        ? "border-emerald-600 text-emerald-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                                        }`}
                                                >
                                                    Assignment
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar (Only visible in Content Tab) */}
                                    {activeTab === "content" && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                                                    <p className="text-gray-500">Module {activeModuleIndex + 1} • Lesson {activeLessonIndex + 1}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handlePrevLesson}
                                                        disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={handleMarkComplete}
                                                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
                                                    >
                                                        Complete & Continue <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Certificate Banner */}
                                            {certificateId && (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-6 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-emerald-900">Course Completed!</h3>
                                                        <p className="text-emerald-700">You have earned a certificate for this course.</p>
                                                    </div>
                                                    <Link href={`/student/certificates/${certificateId}`} className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                                                        View Certificate
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Text Content */}
                                            <div className="prose prose-gray max-w-none">
                                                <h3>Lesson Notes</h3>
                                                <p>
                                                    {activeLesson.content || "No written content is available for this lesson."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "discussion" && (
                                        <div className="animate-in fade-in duration-300">
                                            <DiscussionTab lessonId={activeLesson.id} />
                                        </div>
                                    )}

                                    {activeTab === "assignment" && (
                                        <div className="animate-in fade-in duration-300">
                                            <AssignmentTab
                                                lessonId={activeLesson.id}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                assignment={activeLesson.assignments?.[0] as any}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Select a lesson to start learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
