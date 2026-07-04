"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import CourseCard from "@/components/student/CourseCard";
import { CourseCardView as Course } from "@/types/models";
import FadeIn from "@/components/ui/FadeIn";
import EmptyState from "@/components/ui/EmptyState";

interface Enrollment {
    id: string;
    progressPercent: number;
    course: {
        id: string;
        slug: string;
        title: string;
        description: string;
        thumbnail: string;
        price: number;
        currency: string;
        rating: number;
        studentCount: number;
        duration: number;
        level: string;
        category: string;
        featured: boolean;
    };
}

// Fetcher function
const fetcher = (url: string, token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

export default function MyCoursesPage() {
    const { session } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "in-progress" | "completed">("all");

    const { data: enrollments, error, isLoading } = useSWR(
        session?.access_token ? "/api/enrollments" : null,
        (url) => fetcher(url, session!.access_token)
    );

    // Filter courses
    const filteredEnrollments = useMemo(() => {
        if (!enrollments) return [];

        return enrollments.filter((enrollment: Enrollment) => {
            const course = enrollment.course;
            const matchesSearch =
                searchQuery === "" ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase());

            const status = enrollment.progressPercent === 100 ? "completed" : "in-progress";
            const matchesStatus =
                statusFilter === "all" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, enrollments]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-rose-500 bg-rose-50 rounded-xl">
                Failed to load enrollments. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                <p className="text-muted-foreground">
                    Continue your learning journey
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        aria-label="Search your courses"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "in-progress" | "completed")}
                    aria-label="Filter courses by status"
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer"
                >
                    <option value="all">All Courses</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-gray-900">
                        {filteredEnrollments.length}
                    </span>{" "}
                    {filteredEnrollments.length === 1 ? "course" : "courses"} found
                </p>
            </div>

            {/* Courses Grid */}
            {filteredEnrollments.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnrollments.map((enrollment: Enrollment, index: number) => {
                        const course = enrollment.course;

                        // Adapt to Course interface
                        const adaptedCourse: Course = {
                            id: course.id,
                            slug: course.slug,
                            title: course.title,
                            description: course.description,
                            instructor: {
                                name: "Instructor",
                                avatar: "",
                            },
                            thumbnail: course.thumbnail,
                            price: course.price,
                            currency: course.currency,
                            rating: course.rating,
                            studentCount: course.studentCount,
                            duration: course.duration ? `${Math.round(course.duration / 60)}h` : "N/A",
                            level: course.level as "Beginner" | "Intermediate" | "Advanced",
                            category: course.category,
                            isFree: course.price === 0,
                            isPopular: course.featured,
                        };

                        return (
                            <FadeIn key={enrollment.id} delay={index * 0.1} className="relative group/card">
                                {/* We override the link to go to the PLAYER, not the marketing page */}
                                <div className="relative">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <CourseCard course={adaptedCourse as any} />
                                    {/* Overlay link to player */}
                                    <Link
                                        href={`/student/courses/${course.id}`}
                                        className="absolute inset-0 z-20"
                                    >
                                        <span className="sr-only">Go to course</span>
                                    </Link>
                                </div>

                                {/* Progress Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-100 shadow-lg z-10 pointer-events-none group-hover/card:-translate-y-1 transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Progress
                                        </span>
                                        <span className={`text-xs font-bold ${enrollment.progressPercent === 100 ? "text-emerald-600" : "text-primary"}`}>
                                            {enrollment.progressPercent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${enrollment.progressPercent === 100 ? "bg-emerald-500" : "bg-primary"}`}
                                            style={{ width: `${enrollment.progressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={BookOpen}
                    title="No enrolled courses"
                    description="You haven't enrolled in any courses yet. Explore our library to get started."
                    action={
                        <Link
                            href="/courses"
                            className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 inline-block"
                        >
                            Explore Courses
                        </Link>
                    }
                />
            )}
        </div>
    );
}
