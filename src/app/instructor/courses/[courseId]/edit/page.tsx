"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Plus,
    GripVertical,
    Trash2,
    Video,
    FileText,
    HelpCircle,

    ChevronDown,
    ChevronUp,
    Loader2,
    ImagePlus,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCourseForEdit, updateCourse } from "@/actions/instructor/courses";
import VideoUpload from "@/components/instructor/VideoUpload";
import { QuizBuilder } from "@/components/instructor/QuizBuilder";
import { uploadFile, getAllowedTypes, getMaxSize } from "@/lib/upload";

type Lesson = {
    id?: string;
    title: string;
    type: "video" | "text" | "quiz";
    videoUrl?: string; // Legacy URL fallback
    muxPlaybackId?: string; // New Mux streaming ID
    muxAssetId?: string;
    muxUploadId?: string; // ID of the upload while pending
    content?: string;
    isFree?: boolean;
    duration?: number;
};

type Module = {
    id?: string;
    title: string;
    lessons: Lesson[];
};

type CourseData = {
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail: string;
    price: number;
    // Enhanced Fields
    difficulty: string;
    totalHours: number;
    lectures: number;
    originalPrice: number;
    learningOutcomes: string[];

    modules: Module[];
};

export default function EditCoursePage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Lifted State
    const [courseData, setCourseData] = useState<CourseData>({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        thumbnail: "",
        price: 0,
        difficulty: "Beginner",
        totalHours: 0,
        lectures: 0,
        originalPrice: 0,
        learningOutcomes: [""],
        modules: []
    });


    const fetchCourse = useCallback(async (showLoading = true) => {
        if (!courseId) return;
        if (showLoading) setIsLoading(true);
        try {
            const res = await getCourseForEdit(courseId);
            if (res.success && res.course) {
                const c = res.course;
                setCourseData({
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    level: c.level,
                    thumbnail: c.thumbnail || "",
                    price: c.price,
                    difficulty: c.difficulty || "Beginner",
                    totalHours: c.totalHours,
                    lectures: c.lectures,
                    originalPrice: c.originalPrice || 0,
                    learningOutcomes: c.learningOutcomes.length > 0 ? c.learningOutcomes : [""],
                    // Map modules to mutable array
                    modules: c.modules.map(m => ({
                        id: m.id,
                        title: m.title,
                        lessons: m.lessons.map(l => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const anyLesson = l as any;
                            const hasQuizzes = anyLesson.quizzes && anyLesson.quizzes.length > 0;
                            return {
                                id: l.id,
                                title: l.title,
                                type: hasQuizzes ? "quiz" : ((l.videoUrl || l.muxAssetId) ? "video" : "text"),
                                videoUrl: l.videoUrl || undefined,
                                muxAssetId: l.muxAssetId || undefined,
                                muxPlaybackId: l.muxPlaybackId || undefined,
                                muxUploadId: l.muxUploadId || undefined,
                                content: l.content || undefined,
                                isFree: l.isFree,
                                duration: l.duration
                            };
                        })
                    }))
                });
            } else {
                toast.error("Failed to load course details.");
                router.push("/instructor/courses");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [courseId, router]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleSaveDraft = async () => {
        if (!user) {
            toast.error("You must be logged in");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Saving curriculum...");
        try {
            const result = await updateCourse(courseId, courseData);

            if (result.success) {
                await fetchCourse(false); // Refetch quietly to get real DB IDs
                toast.success("Curriculum saved!", { id: toastId });
            } else {
                toast.error("Failed to save: " + result.error, { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };


    const totalSteps = 4;

    const nextStep = () => {
        if (currentStep < totalSteps) {
            if (currentStep === 1 && !courseData.title) {
                toast.error("Please enter a course title");
                return;
            }
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePublish = async () => {
        if (!user) {
            toast.error("You must be logged in");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateCourse(courseId, courseData);

            if (result.success) {
                toast.success("Course updated successfully!");
                router.push("/instructor/courses");
            } else {
                toast.error("Failed to update course: " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <Link
                    href="/instructor/courses"
                    className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to My Courses
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Course</h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            Update your curriculum and content details.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sidebar Progress (Desktop) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
                        <div className="space-y-6">
                            {[
                                { id: 1, label: "Basic Info", desc: "Title & description" },
                                { id: 2, label: "Curriculum", desc: "Modules & lessons" },
                                { id: 3, label: "Pricing", desc: "Cost & currency" },
                                { id: 4, label: "Review", desc: "Save course" },
                            ].map((step) => (
                                <div key={step.id} className="relative flex gap-4">
                                    {/* Connecting Line */}
                                    {step.id < 4 && (
                                        <div className={`absolute left-4 top-10 bottom-[-24px] w-0.5 ${step.id < currentStep ? "bg-emerald-500" : "bg-gray-100"
                                            }`}></div>
                                    )}

                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.id < currentStep
                                        ? "bg-emerald-500 text-white shadow-emerald-200"
                                        : step.id === currentStep
                                            ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-110"
                                            : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <div className={`transition-colors duration-300 ${step.id === currentStep ? "opacity-100" : "opacity-60"}`}>
                                        <p className={`font-semibold text-sm ${step.id === currentStep ? "text-gray-900" : "text-gray-500"
                                            }`}>{step.label}</p>
                                        <p className="text-xs text-gray-400">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
                        <div className="p-8">
                            {currentStep === 1 && <Step1BasicInfo data={courseData} update={setCourseData} />}
                            {currentStep === 2 && <Step2Curriculum data={courseData} update={setCourseData} onSaveDraft={handleSaveDraft} isSubmitting={isSubmitting} />}
                            {currentStep === 3 && <Step3Pricing data={courseData} update={setCourseData} />}
                            {currentStep === 4 && <Step4Publish data={courseData} />}
                        </div>

                        {/* Navigation Bar */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-xl transition-colors ${currentStep === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                                    }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white font-medium rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 hover:translate-y-[-1px] transition-all"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePublish}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:translate-y-[-1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes <Check className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step1BasicInfo({ data, update }: { data: CourseData, update: React.Dispatch<React.SetStateAction<CourseData>> }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (field: keyof CourseData, value: any) => {
        update(prev => ({ ...prev, [field]: value }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingThumb(true);
        try {
            toast.loading("Uploading thumbnail...", { id: "thumb-upload" });
            const result = await uploadFile(file, {
                bucket: "course-thumbnails",
                allowedTypes: getAllowedTypes('image'),
                maxSize: getMaxSize('image')
            });
            handleChange("thumbnail", result.url);
            toast.success("Thumbnail uploaded successfully!", { id: "thumb-upload" });
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Failed to upload image. Please try again.", { id: "thumb-upload" });
        } finally {
            setIsUploadingThumb(false);
        }
    };

    const handleOutcomeChange = (index: number, value: string) => {
        const newOutcomes = [...data.learningOutcomes];
        newOutcomes[index] = value;
        update(prev => ({ ...prev, learningOutcomes: newOutcomes }));
    };

    const addOutcome = () => {
        update(prev => ({ ...prev, learningOutcomes: [...prev.learningOutcomes, ""] }));
    };

    const removeOutcome = (index: number) => {
        if (data.learningOutcomes.length > 1) {
            const newOutcomes = data.learningOutcomes.filter((_, i) => i !== index);
            update(prev => ({ ...prev, learningOutcomes: newOutcomes }));
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Fundamentals</h2>
                <p className="text-gray-500 mt-1">First, let&apos;s establish the core identity of your course.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="e.g., Solar Installation Mastery: From Zero to Hero"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={4}
                        value={data.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="What will students learn? Who is this for?"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cover Image <span className="text-gray-400 font-normal">(recommended: 1280×720, max 5MB)</span>
                    </label>
                    <div
                        onClick={() => !isUploadingThumb && fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl overflow-hidden transition-all cursor-pointer ${data.thumbnail
                            ? "border-transparent p-0"
                            : "border-gray-200 hover:border-primary/50 bg-gray-50 hover:bg-primary/5 p-10"
                            }`}
                    >
                        {data.thumbnail ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={data.thumbnail}
                                    alt="Cover preview"
                                    className="w-full h-56 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <span className="text-white text-sm font-medium">Click to change image</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange("thumbnail", ""); }}
                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {isUploadingThumb ? (
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                ) : (
                                    <ImagePlus className="w-10 h-10 text-gray-300" />
                                )}
                                <p className="mt-3 text-sm font-medium text-gray-500">
                                    {isUploadingThumb ? "Uploading..." : "Click to upload cover image"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                        <select
                            value={data.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-gray-900 cursor-pointer"
                        >
                            <option value="" disabled>Select a category</option>
                            <option>Solar Energy</option>
                            <option>Wind Power</option>
                            <option>Green Business</option>
                            <option>Technology</option>
                            <option>Innovation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level <span className="text-red-500">*</span></label>
                        <select
                            value={data.level}
                            onChange={(e) => handleChange("level", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-gray-900 cursor-pointer"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Duration (Hours)</label>
                        <input
                            type="number"
                            min="0"
                            value={data.totalHours || ""}
                            onChange={(e) => handleChange("totalHours", parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Lectures</label>
                        <input
                            type="number"
                            min="0"
                            value={data.lectures || ""}
                            onChange={(e) => handleChange("lectures", parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">What will students learn?</label>
                    <div className="space-y-3">
                        {data.learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={outcome}
                                    onChange={(e) => handleOutcomeChange(index, e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                                />
                                {data.learningOutcomes.length > 1 && (
                                    <button
                                        onClick={() => removeOutcome(index)}
                                        className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={addOutcome}
                        className="mt-3 text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add another
                    </button>
                </div>
            </div>
        </div>
    );
}

function Step2Curriculum({ data, update, onSaveDraft, isSubmitting }: { data: CourseData, update: React.Dispatch<React.SetStateAction<CourseData>>, onSaveDraft: () => void, isSubmitting: boolean }) {
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

    const addModule = () => {
        update(prev => ({
            ...prev,
            modules: [...prev.modules, { title: `Module ${prev.modules.length + 1}: New Topic`, lessons: [] }]
        }));
    };

    const addLesson = (moduleIndex: number) => {
        update(prev => ({
            ...prev,
            modules: prev.modules.map((mod, i) => {
                if (i === moduleIndex) {
                    return {
                        ...mod,
                        lessons: [...mod.lessons, { title: "New Lesson", type: "video" }]
                    };
                }
                return mod;
            })
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
        update(prev => ({
            ...prev,
            modules: prev.modules.map((mod, idx) => {
                if (idx === moduleIndex) {
                    return {
                        ...mod,
                        lessons: mod.lessons.map((less, lIdx) => {
                            if (lIdx === lessonIndex) {
                                return { ...less, [field]: value };
                            }
                            return less;
                        })
                    }
                }
                return mod;
            })
        }));
    };

    const updateModuleTitle = (moduleIndex: number, title: string) => {
        update(prev => ({
            ...prev,
            modules: prev.modules.map((mod, idx) => idx === moduleIndex ? { ...mod, title } : mod)
        }));
    };

    const removeModule = (moduleIndex: number) => {
        update(prev => ({
            ...prev,
            modules: prev.modules.filter((_, idx) => idx !== moduleIndex)
        }));
    };

    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        update(prev => ({
            ...prev,
            modules: prev.modules.map((mod, idx) => {
                if (idx === moduleIndex) {
                    return {
                        ...mod,
                        lessons: mod.lessons.filter((_, lIdx) => lIdx !== lessonIndex)
                    };
                }
                return mod;
            })
        }));
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Curriculum Builder</h2>
                <p className="text-gray-500 mt-1">Structure your course content effectively.</p>
            </div>

            <div className="space-y-4">
                {data.modules.map((module, mIdx) => (
                    <div key={mIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                            <div className="cursor-grab hover:bg-gray-200 p-1 rounded text-gray-400">
                                <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                                    className="bg-transparent font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 w-full"
                                />
                            </div>
                            <button onClick={() => removeModule(mIdx)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 bg-white space-y-2">
                            {module.lessons.map((lesson, lIdx) => {
                                const localId = lesson.id ? lesson.id.toString() : `m${mIdx}-l${lIdx}`;
                                return (
                                    <div key={localId} className="rounded-lg border border-gray-100 transition-colors ml-4 overflow-hidden">
                                        <div
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setExpandedLessonId(expandedLessonId === localId ? null : localId)}
                                        >
                                            <div className="text-gray-400">
                                                {lesson.type === 'video' ? <Video className="w-4 h-4" /> : lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                                            <div className="ml-auto flex items-center gap-2">
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                                    {lesson.type}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeLesson(mIdx, lIdx); }} className="text-gray-400 hover:text-red-500 mx-2 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                {expandedLessonId === localId ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>

                                        {expandedLessonId === localId && (
                                            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lesson Title</label>
                                                    <input
                                                        type="text"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Content Type</label>
                                                    <select
                                                        value={lesson.type}
                                                        onChange={(e) => updateLesson(mIdx, lIdx, "type", e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                                    >
                                                        <option value="video">Video</option>
                                                        <option value="text">Document/Article (PDF, PPT, Word)</option>
                                                        <option value="quiz">Quiz</option>
                                                    </select>
                                                </div>

                                                {lesson.type === "quiz" && (
                                                    <div>
                                                        {lesson.id ? (
                                                            <>
                                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quiz Builder</label>
                                                                <QuizBuilder lessonId={lesson.id} />
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-700 text-center">
                                                                <HelpCircle className="w-8 h-8 flex-shrink-0 text-amber-500" />
                                                                <p className="max-w-xs">You must save your curriculum to unlock the Quiz Builder for this lesson.</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={onSaveDraft}
                                                                    disabled={isSubmitting}
                                                                    className="mt-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                                                                >
                                                                    {isSubmitting ? "Saving..." : "Save Curriculum Now"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {lesson.type === "video" && (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Video File</label>
                                                        <VideoUpload
                                                            lessonId={undefined}
                                                            currentUrl={lesson.videoUrl}
                                                            currentPlaybackId={lesson.muxPlaybackId}
                                                            onUploadComplete={(d) => {
                                                                updateLesson(mIdx, lIdx, "videoUrl", d.url || "");
                                                                if (d.uploadId) updateLesson(mIdx, lIdx, "muxUploadId", d.uploadId);
                                                                if (d.muxPlaybackId) updateLesson(mIdx, lIdx, "muxPlaybackId", d.muxPlaybackId);
                                                                if (d.muxAssetId) updateLesson(mIdx, lIdx, "muxAssetId", d.muxAssetId);
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {lesson.type === "text" && (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Document File</label>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            {lesson.content ? (
                                                                <div className="flex-1 flex items-center justify-between bg-blue-50 text-blue-700 px-4 py-3 rounded-lg border border-blue-100">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <FileText className="w-5 h-5 flex-shrink-0" />
                                                                        <a href={lesson.content} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate">
                                                                            View Uploaded Document
                                                                        </a>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => updateLesson(mIdx, lIdx, "content", "")}
                                                                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full relative">
                                                                    <input 
                                                                        type="file"
                                                                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            
                                                                            toast.loading("Uploading document...", { id: "doc-upload" });
                                                                            try {
                                                                                const result = await uploadFile(file, {
                                                                                    bucket: "course-assets",
                                                                                    folder: "documents",
                                                                                    allowedTypes: getAllowedTypes('document'),
                                                                                    maxSize: getMaxSize('document')
                                                                                });
                                                                                updateLesson(mIdx, lIdx, "content", result.url);
                                                                                toast.success("Document uploaded successfully!", { id: "doc-upload" });
                                                                            } catch (error) {
                                                                                console.error(error);
                                                                                toast.error(error instanceof Error ? error.message : "Failed to upload document", { id: "doc-upload" });
                                                                            }
                                                                        }}
                                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            <button
                                onClick={() => addLesson(mIdx)}
                                className="ml-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Lesson
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addModule}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Add New Module
            </button>
        </div>
    );
}

function Step3Pricing({ data, update }: { data: CourseData, update: React.Dispatch<React.SetStateAction<CourseData>> }) {
    const isPaid = data.price > 0 || data.originalPrice > 0;

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Pricing Strategy</h2>
                <p className="text-gray-500 mt-1">Set a fair price for the value you provide.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <label
                    className={`relative flex flex-col p-6 cursor-pointer bg-white border-2 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all ${isPaid ? "border-gray-900" : "border-gray-200 opacity-70"}`}
                    onClick={() => {
                        if (data.price === 0) update(prev => ({ ...prev, price: 5000 }));
                    }}
                >
                    <input type="radio" name="pricing" className="peer sr-only" checked={isPaid} onChange={() => { }} />
                    {isPaid && <div className="absolute top-6 right-6 text-emerald-500"><Check className="w-6 h-6" /></div>}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Paid Course</h3>
                    <p className="text-sm text-gray-500 mb-6">Set a one-time fee for lifetime access.</p>
                    <div className="mt-auto space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Sale Price (NGN)</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-400 text-lg">₦</span>
                                <input
                                    type="number"
                                    value={data.price || ""}
                                    onChange={(e) => update(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                    placeholder="5000"
                                    className="w-full text-2xl font-bold text-gray-900 bg-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Original Price (optional)</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-400 text-lg">₦</span>
                                <input
                                    type="number"
                                    value={data.originalPrice || ""}
                                    onChange={(e) => update(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                                    placeholder="10000"
                                    className="w-full text-xl font-medium text-gray-500 bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </label>

                <label
                    className={`relative flex flex-col p-6 cursor-pointer bg-white border-2 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all ${!isPaid ? "border-gray-900" : "border-gray-200 opacity-70"}`}
                    onClick={() => update(prev => ({ ...prev, price: 0, originalPrice: 0 }))}
                >
                    <input type="radio" name="pricing" className="peer sr-only" checked={!isPaid} onChange={() => { }} />
                    {!isPaid && <div className="absolute top-6 right-6 text-emerald-500"><Check className="w-6 h-6" /></div>}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Free Course</h3>
                    <p className="text-sm text-gray-500">Offer this course for free.</p>
                </label>
            </div>
        </div>
    );
}

function Step4Publish({ data }: { data: CourseData }) {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Save!</h2>
                <p className="text-gray-500 mt-2">
                    Review your changes before updating.
                </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-2xl mx-auto space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Course Summary</h3>
                {[
                    `Title: ${data.title}`,
                    `Category: ${data.category}`,
                    `Modules: ${data.modules.length}`,
                    `Price: ${data.price > 0 ? "Paid" : "Free"}`
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3" />
                        </div>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
