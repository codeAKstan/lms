"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
    Star,
    Users,
    Award,
    CheckCircle,
    PlayCircle,
    Loader2,
    Share2,
    Heart,
    Download,
    Infinity as InfinityIcon,
    ArrowRight
} from "lucide-react";
import CurriculumAccordion from "@/components/student/CurriculumAccordion";
import VideoPlayer from "@/components/student/VideoPlayer";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import MarketingCourseCard, { ApiCourse } from "@/components/marketing/MarketingCourseCard";

// Props from Server Component
interface CourseLandingClientProps {
    slug: string;
    initialCourse?: CourseData;
}

interface LessonPreview {
    muxPlaybackId?: string;
    videoUrl?: string;
    type?: string;
    content?: string;
}

interface CourseModule {
    lessons: LessonPreview[];
}

// Loose type for the full course data fetched from the API
type CourseData = Record<string, unknown>;


interface Review {
    id: string;
    user: {
        name: string;
        avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

const fetcher = (url: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { headers }).then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
    });
};

export default function CourseLandingClient({ slug, initialCourse }: CourseLandingClientProps) {
    const { user, session } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Fetch Course Data
    const { data: course, error, isLoading } = useSWR(
        `/api/courses/slug/${slug}`,
        (url) => fetcher(url),
        { fallbackData: initialCourse }
    );

    // 2. Fetch Related Courses (Same Category)
    const { data: relatedCourses } = useSWR(
        course?.category ? `/api/courses?category=${encodeURIComponent(course.category)}&limit=4` : null,
        (url) => fetcher(url)
    );

    // Track the currently previewed lesson
    const [activePreviewLesson, setActivePreviewLesson] = useState<LessonPreview | null>(null);

    // Set initial preview when course loads
    useMemo(() => {
        if (course?.modules && !activePreviewLesson) {
            const firstVideo = course.modules.flatMap((m: CourseModule) => m.lessons).find((l: LessonPreview) => l.muxPlaybackId || l.videoUrl || (l.type === 'video' && l.content?.includes('http')));
            if (firstVideo) {
                setActivePreviewLesson(firstVideo);
            }
        }
    }, [course, activePreviewLesson]);

    // 3. Fetch User Enrollments
    const { data: enrollments } = useSWR(
        session?.access_token ? "/api/enrollments" : null,
        (url) => fetcher(url, session!.access_token)
    );

    const isEnrolled = enrollments?.some((e: { courseId: string }) => e.courseId === course?.id);

    // Handle Enrollment / Payment
    const handleEnroll = async () => {
        if (!user) {
            toast.error("Please login to enroll");
            router.push(`/login?redirect=/courses/${slug}`);
            return;
        }

        setIsProcessing(true);

        try {
            if (course.isFree || course.price === 0) {
                const res = await fetch("/api/enrollments", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({ courseId: course.id }),
                });

                if (!res.ok) throw new Error("Enrollment failed");
                toast.success("Successfully enrolled!");
                router.push("/student/courses");
            } else {
                const res = await fetch("/api/payments/initialize", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({
                        courseId: course.id,
                        callbackUrl: `${window.location.origin}/payment/callback`,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Payment init failed");
                window.location.href = data.url;
            }
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast.error(message);
            setIsProcessing(false);
        }
    };

    if (error) return <div className="p-12 text-center text-red-500">Failed to load course.</div>;
    if (isLoading && !course) return (
        <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#006a6a]" />
        </div>
    );

    if (!course) return null;

    const curriculum = course ? { modules: course.modules || [] } : null;
    
    // Formatting helpers
    const formatPrice = (amount: number) => {
        if (amount === 0) return "Free";
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
    };

    // Calculate course stats
    const totalModules = curriculum?.modules?.length || 0;
    const totalLessons = curriculum?.modules?.reduce((acc: number, m: CourseModule) => acc + (m.lessons?.length || 0), 0) || 0;
    const totalHours = course.totalHours || Math.round((course.duration || 0) / 60);

    return (
        <div className="min-h-screen bg-[#f7f9fb] pb-24">
            {/* Hero Section */}
            <div className="bg-[#00153e] text-white pt-24 md:pt-32 pb-20">
                <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Hero Text */}
                        <div className="max-w-2xl">
                            {/* Category Badge */}
                            <span className="inline-block px-3 py-1 rounded-full bg-[#006a6a] text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                                {course.category || "CLEANTECH FUNDAMENTALS"}
                            </span>

                            {/* Title */}
                            <h1 className="text-4xl md:text-[44px] font-bold leading-tight mb-6">
                                {course.title}
                            </h1>

                            {/* Instructor */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-white text-[#00153e] flex items-center justify-center text-lg font-bold overflow-hidden">
                                    {course.instructor?.avatar ? (
                                        <Image src={course.instructor.avatar} alt={course.instructor.name} width={48} height={48} className="object-cover w-full h-full" />
                                    ) : (
                                        course.instructor?.name?.[0] || "I"
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-base leading-tight">
                                        {course.instructor?.name || "Expert Instructor"}
                                    </p>
                                    <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                                        {course.instructor?.bio?.substring(0, 50) || "RENEWABLE ENERGY EXPERT"}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-8 text-sm">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                    <Star className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />
                                    <span className="font-bold text-white">{course.rating > 0 ? course.rating.toFixed(1) : "New"}</span>
                                    <span className="text-white/70">({course.reviews?.length || 0} Ratings)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-white/70" />
                                    <span className="text-white/90">{course.studentCount?.toLocaleString() || 0} Enrolled Students</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Video Player */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video bg-[#092962]">
                            {activePreviewLesson?.muxPlaybackId || activePreviewLesson?.videoUrl ? (
                                <VideoPlayer videoUrl={activePreviewLesson.videoUrl} muxPlaybackId={activePreviewLesson.muxPlaybackId} />
                            ) : course.thumbnail ? (
                                <div className="relative w-full h-full">
                                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                                            <PlayCircle className="w-8 h-8 text-[#00153e] ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                    <PlayCircle className="w-16 h-16 opacity-50 mb-2" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 md:px-12 py-12 max-w-[1440px] -mt-8">
                <div className="grid lg:grid-cols-3 gap-12 relative">
                    {/* Left Column - Course Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* What You'll Learn */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-[#191c1e] mb-6">
                                What you&apos;ll learn
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                                {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                                    course.learningOutcomes.map((outcome: string, idx: number) => (
                                        <LearningPoint key={idx} text={outcome} />
                                    ))
                                ) : (
                                    <p className="text-sm text-[#757781] col-span-2">No specific learning outcomes listed yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
                                <h2 className="text-2xl font-bold text-[#191c1e]">
                                    Course Content
                                </h2>
                                <span className="text-sm font-medium text-[#757781]">
                                    {totalModules} Modules • {totalLessons} Lessons • {totalHours}h 30m total length
                                </span>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {curriculum && (
                                    <CurriculumAccordion 
                                        modules={curriculum.modules} 
                                        onPreview={(lesson) => setActivePreviewLesson(lesson)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Student Feedback */}
                        <div>
                            <h2 className="text-2xl font-bold text-[#191c1e] mb-6">
                                Student Feedback
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {course.reviews && course.reviews.length > 0 ? (
                                    course.reviews.map((review: Review) => (
                                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex text-[#ffcc00] mb-4">
                                                {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-current" : "text-gray-200"}`} />)}
                                            </div>
                                            <p className="italic text-[#444650] text-sm mb-6 leading-relaxed">
                                                &quot;{review.comment}&quot;
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#00153e] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                                                    {review.user?.avatar ? (
                                                        <Image src={review.user.avatar} alt={review.user.name} width={40} height={40} className="object-cover w-full h-full" />
                                                    ) : (
                                                        review.user?.name?.charAt(0) || "U"
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#191c1e]">{review.user?.name || "Student"}</p>
                                                    <p className="text-xs text-[#757781]">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-sm text-[#757781]">No reviews yet. Be the first to review this course!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related Courses Section */}
                        <div className="pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#191c1e]">Related Courses</h2>
                                <Link href="/courses" className="text-sm font-bold text-[#006a6a] hover:underline">
                                    View all courses
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {relatedCourses?.data?.filter((c: ApiCourse) => c.id !== course.id).slice(0, 4).map((relatedCourse: ApiCourse) => (
                                    <MarketingCourseCard key={relatedCourse.id} course={relatedCourse} />
                                )) || (
                                    <p className="text-sm text-[#757781]">No related courses found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Enrollment Card (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Main Sticky Card */}
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                {/* Price */}
                                <div className="mb-6">
                                    {isEnrolled ? (
                                        <div className="text-2xl font-bold text-[#1b5936] mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-6 h-6" /> You are enrolled
                                        </div>
                                    ) : (
                                        <>
                                            {course.isFree || course.price === 0 ? (
                                                <div className="text-[40px] font-bold text-[#191c1e] leading-none mb-2">Free</div>
                                            ) : (
                                                <div className="flex items-end gap-3 mb-2">
                                                    <span className="text-[40px] font-bold text-[#191c1e] leading-none">
                                                        {formatPrice(course.price)}
                                                    </span>
                                                    <span className="text-lg text-[#757781] line-through mb-1 font-medium">
                                                        {formatPrice(course.originalPrice || course.price * 2)}
                                                    </span>
                                                </div>
                                            )}
                                            {!isEnrolled && !course.isFree && (
                                                <p className="text-sm font-bold text-[#d93025]">
                                                    50% off - Limited Time Promotion
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 mb-8">
                                    {isEnrolled ? (
                                        <Link
                                            href={`/student/courses/${course.id}`}
                                            className="flex items-center justify-center w-full py-4 bg-[#f5d300] text-[#191c1e] rounded-xl font-bold text-base hover:bg-[#e6c600] transition-colors"
                                        >
                                            Go to Course
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleEnroll}
                                                disabled={isProcessing}
                                                className="flex items-center justify-center w-full py-4 bg-[#f5d300] text-[#191c1e] rounded-xl font-bold text-base hover:bg-[#e6c600] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {isProcessing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                                    </div>
                                                ) : (
                                                    "Enroll Now"
                                                )}
                                            </button>
                                            <button className="flex items-center justify-center w-full py-4 bg-white border-2 border-[#00153e] text-[#00153e] rounded-xl font-bold text-base hover:bg-gray-50 transition-colors">
                                                Save to Path
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Course Includes */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-[#191c1e] text-sm">
                                        This course includes:
                                    </h4>
                                    <CourseFeature icon={<PlayCircle className="w-4 h-4" />} text={`${totalHours} hours on-demand video`} />
                                    <CourseFeature icon={<Download className="w-4 h-4" />} text={`${course.resourcesCount || 0} downloadable resources`} />
                                    <CourseFeature icon={<Award className="w-4 h-4" />} text="Certificate of Completion" />
                                    <CourseFeature icon={<InfinityIcon className="w-4 h-4" />} text="Full lifetime access" />
                                </div>

                                {/* Footer Links */}
                                <div className="flex items-center justify-around pt-6 mt-6 border-t border-gray-100 text-sm font-bold text-[#444650]">
                                    <button className="flex items-center gap-2 hover:text-[#00153e] transition-colors">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-[#00153e] transition-colors">
                                        <Heart className="w-4 h-4" /> Wishlist
                                    </button>
                                </div>
                            </div>

                            {/* Corporate Training Card */}
                            <div className="bg-[#00153e] p-6 rounded-2xl text-white shadow-xl shadow-gray-200/50">
                                <h3 className="font-bold text-lg mb-2">Corporate Training</h3>
                                <p className="text-sm text-white/80 mb-4 leading-relaxed">
                                    Training 5 or more people? Get access to our business platform with team tracking.
                                </p>
                                <Link href="/business" className="text-[#90efef] text-sm font-bold flex items-center gap-1 hover:text-white transition-colors">
                                    Learn about CTH EdTech fo Business <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LearningPoint({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#006a6a] flex-shrink-0" />
            <span className="text-sm text-[#444650] leading-snug">{text}</span>
        </div>
    );
}

function CourseFeature({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3 text-[#444650]">
            <div className="text-[#006a6a]">{icon}</div>
            <span className="text-sm">{text}</span>
        </div>
    );
}
