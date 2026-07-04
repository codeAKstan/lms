"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, BookOpen, Users, Star, MoreHorizontal, LayoutGrid, List, Calendar, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getInstructorCourses } from "@/actions/instructor/courses";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

type Course = {
    id: string;
    title: string;
    category: string;
    thumbnail: string | null;
    published: boolean;
    _count: { enrollments: number };
    rating: number;
    updatedAt: Date;
    modules: { id: string }[];
};

export default function InstructorCoursesPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("all");
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) return;

        async function fetchCourses() {
            try {
                const res = await getInstructorCourses(user!.id);
                if (res.success && res.courses) {
                    setCourses(res.courses as unknown as Course[]);
                } else {
                    toast.error("Failed to load courses");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred fetching courses");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter((course) => {
        // Tab Filter
        if (activeTab === "published" && !course.published) return false;
        if (activeTab === "drafts" && course.published) return false;

        // Search Filter
        if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <Link
                        href="/instructor/courses/new"
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:translate-y-[-1px] transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Course</span>
                    </Link>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl w-full md:w-auto">
                    {["All Courses", "Published", "Drafts", "Archived"].map((tab) => {
                        const slug = tab.toLowerCase().replace(" ", "-");
                        const isActive = activeTab === slug || (activeTab === "all" && slug === "all-courses");
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(slug === "all-courses" ? "all" : slug)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-md transition-all ${viewMode === "grid"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-md transition-all ${viewMode === "list"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:border-primary/20 flex flex-col h-full">
                        {/* Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {course.thumbnail ? (
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <BookOpen className="w-12 h-12 text-gray-300" />
                            )}
                            <div className="absolute top-3 left-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${course.published
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 bg-white/90"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-700 bg-white/90"
                                    }`}>
                                    {course.published ? "Published" : "Draft"}
                                </span>
                            </div>

                            {/* ACTION BUTTONS ON IMAGE HOVER */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/instructor/courses/${course.id}/edit`}
                                    className="p-2 bg-white/90 shadow-sm backdrop-blur-sm rounded-full hover:bg-white text-primary transition-colors hover:text-primary/80"
                                    title="Edit Course"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button className="p-2 bg-white/90 shadow-sm backdrop-blur-sm rounded-full hover:bg-white text-gray-700 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                            <div className="bg-blue-50/50 self-start px-2 py-1 rounded text-xs font-semibold text-blue-600 mb-3">
                                {course.category}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {course.title}
                            </h3>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-muted-foreground">
                                <Link
                                    href={`/instructor/courses/${course.id}/assignments`}
                                    className="flex items-center gap-1.5 hover:text-primary transition-colors z-20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span>Assignments</span>
                                </Link>
                                <Link
                                    href={`/instructor/courses/${course.id}/sessions`}
                                    className="flex items-center gap-1.5 hover:text-primary transition-colors z-20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Sessions</span>
                                </Link>
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    <span>{course._count?.enrollments || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span>{course.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card (Empty State) */}
                <Link
                    href="/instructor/courses/new"
                    className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-blue-50/30 transition-all group gap-4 cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-primary/50 group-hover:text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-900">Create New Course</p>
                        <p className="text-sm text-gray-500 mt-1">Start from scratch</p>
                    </div>
                </Link>
            </div>

            {filteredCourses.length === 0 && courses.length > 0 && (
                <div className="text-center py-20 text-gray-500">
                    No courses found matching your criteria.
                </div>
            )}
        </div>
    );
}
