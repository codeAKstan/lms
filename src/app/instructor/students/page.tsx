"use client";

import { Search, Users, Loader2, BookOpen, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getInstructorStudents } from "@/actions/instructor/students";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Student = {
    id: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    courseId: string;
    courseName: string;
    enrolledAt: Date;
    progress: number;
    completedLessons: number;
    totalLessons: number;
};

type Course = {
    id: string;
    title: string;
};

export default function InstructorStudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) return;

        async function fetchStudents() {
            try {
                const res = await getInstructorStudents(user!.id);
                if (res.success && res.students) {
                    setStudents(res.students as Student[]);
                    setCourses(res.courses || []);
                } else {
                    toast.error("Failed to load students");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred");
            } finally {
                setIsLoading(false);
            }
        }

        fetchStudents();
    }, [user]);

    const filteredStudents = students.filter((s) => {
        if (selectedCourse !== "all" && s.courseId !== selectedCourse) return false;
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !s.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const avgProgress = filteredStudents.length > 0
        ? Math.round(filteredStudents.reduce((acc, s) => acc + s.progress, 0) / filteredStudents.length)
        : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Quick Stat Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <Activity className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Avg. Progress</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Courses with Students</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 cursor-pointer"
                >
                    <option value="all">All Courses</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {student.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={student.image} alt={student.name} className="w-9 h-9 object-cover rounded-full" />
                                                ) : (
                                                    student.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 max-w-[200px] line-clamp-1">{student.courseName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(student.enrolledAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">{student.completedLessons}/{student.totalLessons} lessons</span>
                                                <span className={`font-bold ${student.progress >= 80 ? 'text-emerald-600' : student.progress >= 40 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                    {student.progress}%
                                                </span>
                                            </div>
                                            <div className="w-36 bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${student.progress >= 80 ? 'bg-emerald-500' : student.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="font-medium text-gray-500">No students found</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {searchQuery ? `No match for "${searchQuery}"` : "Publish a course to start enrolling students."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
