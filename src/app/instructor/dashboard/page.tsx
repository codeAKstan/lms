"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    Users,
    BookOpen,
    TrendingUp,
    Star,
    ArrowUpRight,
    Loader2,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// Button imported via ui is no longer used here (replaced with native elements)
import { useAuth } from "@/components/providers/AuthProvider";
import { getInstructorDashboardData } from "@/actions/instructor/dashboard";
import { toast } from "sonner";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

type DashboardData = {
    stats: {
        totalRevenue: number;
        totalStudents: number;
        activeCourses: number;
        averageRating: number;
        studentGrowthPercent: string;
        instructorTrack: string;
        averageProgress: number;
        revenueGoalProgress: number;
        totalReviews: number;
    };
    coursePerformanceData: number[];
    revenueGraph: { month: string; revenue: number }[];
    recentCourses: {
        id: string;
        title: string;
        students: number;
        revenue: number;
        rating: number;
        thumbnail: string | null;
        published: boolean;
        updatedAt: Date;
    }[];
};

export default function InstructorDashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchDashboard() {
            try {
                const res = await getInstructorDashboardData(user!.id);
                if (res.success && res.data) {
                    setData(res.data as DashboardData);
                } else {
                    toast.error("Failed to load dashboard data");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred loading dashboard");
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboard();
    }, [user]);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const { stats, recentCourses, revenueGraph } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Total Students"
                    value={stats.totalStudents.toLocaleString()}
                    trend={stats.studentGrowthPercent}
                    trendLabel={`Active across ${stats.instructorTrack.toLowerCase()} tracks`}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Course Performance"
                    value={`${stats.activeCourses}`}
                    trend={stats.averageProgress >= 80 ? "Excellent" : stats.averageProgress >= 50 ? "Good" : "Needs Work"}
                    trendLabel={`Average student completion: ${stats.averageProgress}%`}
                    color="emerald"
                    hasChart={true}
                    chartData={data.coursePerformanceData}
                />
                <StatCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Total Earnings (NGN)"
                    value={`₦${stats.totalRevenue.toLocaleString()}`}
                    trend="Link"
                    trendLabel={`${stats.revenueGoalProgress}% of last month's revenue`}
                    color="blue"
                    hasProgress={true}
                    progressValue={stats.revenueGoalProgress}
                />
                <StatCard
                    icon={<Star className="w-5 h-5" />}
                    label="Avg. Rating"
                    value={`${stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}`}
                    trend={stats.averageRating >= 4.5 ? "Top 10%" : "Overall"}
                    trendLabel={`From ${stats.totalReviews} reviews`}
                    color="amber"
                />
            </div>

            <div className="space-y-8">
                {/* Main Content Area (full width) */}
                <div className="space-y-8">
                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                            <span className="px-3 py-1.5 bg-gray-50 border-transparent rounded-lg text-sm text-gray-600">
                                Last 6 Months
                            </span>
                        </div>
                        <div className="h-72 w-full">
                            {revenueGraph.every(m => m.revenue === 0) ? (
                                <div className="h-full flex items-center justify-center flex-col text-gray-400">
                                    <TrendingUp className="w-10 h-10 mb-3 opacity-50" />
                                    <p>No recent revenue data</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueGraph} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            tickFormatter={(value) => `₦${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={((value: number) => [`₦${value.toLocaleString()}`, 'Revenue']) as never}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* My Courses Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#00153e]">My Courses</h2>
                            <Link
                                href="/instructor/courses"
                                className="text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {recentCourses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No courses found. Enhance your dashboard by creating a course.
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-[#f5f7fa]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#00153e] uppercase tracking-wider">Course Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#00153e] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#00153e] uppercase tracking-wider">Enrollments</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#00153e] uppercase tracking-wider">Rating</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-[#00153e] uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentCourses.map((course) => (
                                            <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                                                            {course.thumbnail ? (
                                                                <Image src={course.thumbnail} alt="" fill className="object-cover" />
                                                            ) : (
                                                                <BookOpen className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-[200px]">
                                                            <p className="font-bold text-sm text-[#00153e] truncate" title={course.title}>{course.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${!course.published
                                                        ? "bg-[#ffe4d6] text-[#cc4a00]"
                                                        : "bg-[#b2f5ea] text-[#00665c]"
                                                        }`}>
                                                        {!course.published ? "Draft" : "Live"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#00153e] font-medium">
                                                    {course.students.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-[#00153e] flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    {course.rating ? course.rating.toFixed(1) : "0.0"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/instructor/courses/${course.id}/edit`}>
                                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Promotional Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upcoming Webinar Card */}
                    <div className="relative bg-[#0d2240] rounded-2xl p-8 text-white overflow-hidden">
                        {/* Background globe decoration */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                            <div className="w-32 h-32 rounded-full border-4 border-white">
                                <div className="w-full h-full rounded-full border-2 border-white/40 m-1"></div>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6ee7d0] mb-4">Upcoming Webinar</p>
                        <h3 className="text-2xl font-extrabold leading-tight mb-3">
                            Clean Tech Innovation Summit: Africa 2026
                        </h3>
                        <p className="text-sm text-blue-200 mb-8">
                            Join over 500 instructors to discuss scaling clean technology across the continent. Exclusive for certified partners.
                        </p>
                        <button className="bg-white text-[#0d2240] text-sm font-bold px-6 py-3 rounded hover:bg-blue-50 transition-colors shadow-sm">
                            Register for Free
                        </button>
                    </div>

                    {/* Need Help Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-start gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#00153e] mb-2">Need help with your content?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Our instructional design team is here to help you optimize your clean-tech curriculum for better student engagement.
                            </p>
                            <a href="mailto:[mails@cleantechnologyhub.org]" className="text-[#006a6a] font-bold text-sm hover:underline">
                                Book a consultation →
                            </a>
                        </div>
                        <div className="flex-shrink-0 h-24 w-24 bg-[#f5f7fa] rounded-2xl flex items-center justify-center">
                            <Users className="w-12 h-12 text-[#006a6a] opacity-60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type StatCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: string;
    trendLabel: string;
    color: "emerald" | "blue" | "purple" | "amber";
    hasChart?: boolean;
    hasProgress?: boolean;
    progressValue?: number;
    chartData?: number[];
};

function StatCard({
    icon,
    label,
    value,
    trend,
    trendLabel,
    color,
    hasChart,
    hasProgress,
    progressValue,
    chartData
}: StatCardProps) {
    const bgColors = {
        emerald: "bg-emerald-100/60",
        blue: "bg-[#006a6a]/10", // Using CTH teal for the mock UI match
        purple: "bg-purple-100/60",
        amber: "bg-amber-100/60"
    };

    const textColors = {
        emerald: "text-emerald-700",
        blue: "text-[#006a6a]",
        purple: "text-purple-700",
        amber: "text-amber-700"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl ${bgColors[color]} ${textColors[color]} flex items-center justify-center`}>
                    {icon}
                </div>
                {trend === "Link" ? (
                    <button className="text-gray-400 hover:text-gray-600">
                        <ArrowUpRight className="w-5 h-5" />
                    </button>
                ) : (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded bg-opacity-50 ${bgColors[color]} ${textColors[color]}`}>
                        {trend}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-end">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</h4>
                
                {hasChart ? (
                    <div className="flex items-end gap-1.5 h-12 mb-2 mt-1">
                        {chartData && chartData.length > 0 ? chartData.map((val, i) => (
                            <div key={i} className={`flex-1 ${i === 3 ? "bg-[#00153e]" : i % 2 === 0 ? "bg-[#006a6a]" : "bg-gray-200"} rounded-sm transition-all duration-500`} style={{ height: `${Math.max(10, val)}%` }}></div>
                        )) : (
                            <>
                                <div className="flex-1 bg-gray-100 rounded-sm h-1/3"></div>
                                <div className="flex-1 bg-gray-200 rounded-sm h-1/2"></div>
                                <div className="flex-1 bg-[#006a6a] rounded-sm h-3/4"></div>
                                <div className="flex-1 bg-[#00153e] rounded-sm h-full"></div>
                                <div className="flex-1 bg-[#006a6a] rounded-sm h-2/3"></div>
                            </>
                        )}
                    </div>
                ) : (
                    <h3 className="text-3xl font-extrabold text-[#00153e] tracking-tight mb-2">{value}</h3>
                )}
                
                {hasProgress && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 mt-1">
                        <div className="bg-[#00153e] h-1.5 rounded-full" style={{ width: `${progressValue || 0}%` }}></div>
                    </div>
                )}
                
                <p className="text-xs text-gray-500 mt-auto">{trendLabel}</p>
            </div>
        </div>
    );
}
