"use client";

import { CheckCircle, XCircle, Eye, Trash2, FileText, Loader2, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getCourses, updateCourseStatus, deleteCourse, CourseResult } from "@/actions/admin/courses";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<CourseResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "pending">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search to prevent excessive API calls
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const { courses, totalPages } = await getCourses({
                page,
                limit: 10,
                search: debouncedSearch,
                status: statusFilter,
            });
            setCourses(courses);
            setTotalPages(totalPages);
        } catch {
            toast.error("Failed to fetch courses");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleStatusUpdate = async (courseId: string, newStatus: boolean) => {
        const promise = updateCourseStatus(courseId, newStatus);

        toast.promise(promise, {
            loading: "Updating status...",
            success: () => {
                fetchCourses(); // Refresh list
                return `Course ${newStatus ? "published" : "market as pending"} `;
            },
            error: "Failed to update status",
        });
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        const promise = deleteCourse(courseId);

        toast.promise(promise, {
            loading: "Deleting course...",
            success: () => {
                fetchCourses();
                return "Course deleted successfully";
            },
            error: "Failed to delete course",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">


            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search title, instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full md:w-64"
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                        {(["all", "pending", "published"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setStatusFilter(tab);
                                    setPage(1); // Reset page on filter change
                                }}
                                className={`px - 4 py - 2 rounded - lg text - sm font - medium transition - all capitalize ${statusFilter === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    } `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Course Title
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Instructor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Revenue (Est.)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No courses found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {course.instructor}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium ${course.status === "published"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                                        } `}
                                                >
                                                    <span className={`w - 1.5 h - 1.5 rounded - full mr - 1.5 ${course.status === "published" ? "bg-emerald-500" : "bg-amber-500"} `}></span>
                                                    {course.status === "published" ? "Published" : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                                                {course.students.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                                                ₦{course.revenue.toLocaleString()}
                                                {/* Revenue stored in Naira */}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(course.submittedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {/* Actions */}
                                                    <Link
                                                        href={`/courses/${course.slug}`}
                                                        className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900"
                                                        title="View Course"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {course.status === "pending" ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(course.id, true)}
                                                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-gray-500 hover:text-emerald-600"
                                                            title="Approve / Publish"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(course.id, false)}
                                                            className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-gray-500 hover:text-amber-600"
                                                            title="Unpublish"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDelete(course.id)}
                                                        className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-gray-500 hover:text-rose-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
