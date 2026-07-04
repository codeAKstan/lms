"use client";

import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    DollarSign,
    Award,
    Calendar,
    ArrowUpRight,
    Search,
    Loader2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { getInstructorAnalytics } from "@/actions/instructor/analytics";

type AnalyticsData = {
    totalRevenue: number;
    totalStudents: number;
    activeCourses: number;
    averageRating: number;
    coursePerformance: {
        id: string;
        name: string;
        sales: number;
        rating: number;
        revenue: number;
    }[];
};

export default function InstructorAnalyticsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) return;

        async function fetchAnalytics() {
            try {
                const res = await getInstructorAnalytics(user!.id);
                if (res.success && res.data) {
                    setData(res.data as AnalyticsData);
                } else {
                    toast.error("Failed to load analytics");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred loading analytics");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalytics();
    }, [user]);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const filteredCourses = data.coursePerformance.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Lifetime
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                    <h3 className="text-2xl font-bold text-gray-900">₦{data.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Total
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <h3 className="text-2xl font-bold text-gray-900">{data.totalStudents.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Active Courses</p>
                    <h3 className="text-2xl font-bold text-gray-900">{data.activeCourses}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            Overall
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                    <h3 className="text-2xl font-bold text-gray-900">{data.averageRating ? data.averageRating.toFixed(1) : "0.0"}/5.0</h3>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Course Performance Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Course Performance</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses..."
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-48 transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Enrollments</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCourses.length > 0 ? filteredCourses.map((course, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 line-clamp-1">{course.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{course.sales}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                                                ★ {course.rating ? course.rating.toFixed(1) : "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">₦{course.revenue.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No courses found matching &quot;{searchQuery}&quot;
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Earning Trend / Placeholder */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Payouts</h2>
                    <div className="flex-1 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Next Payout: End of Month</p>
                            <p className="text-sm text-gray-500">Estimated: ₦{data.totalRevenue > 0 ? Math.round(data.totalRevenue * 0.1).toLocaleString() : 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Estimating based on recent activity</p>
                        </div>
                        <button className="text-sm font-medium text-primary hover:underline mt-4">
                            Setup Payment Method
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
