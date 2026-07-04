"use client";

import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    DollarSign,
    Activity,
    UserPlus,
    Upload,
    ArrowRight,
    Loader2,
    FileText,
    MoreHorizontal,
    TrendingUp,
    CheckCircle,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { getAdminDashboardStats } from "@/actions/admin/dashboard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

type RecentCourse = {
    id: string;
    title: string;
    slug: string;
    instructor: string;
    status: "published" | "draft";
    enrollment: number;
};

type DashboardData = {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    activeUsers: number;
    revenueChart: { month: string; revenue: number }[];
    weeklyChart: { month: string; revenue: number }[];
    trends: {
        users: number;
        courses: number;
        revenue: number;
        usersLast30: number;
        coursesLast30: number;
    };
    activityFeed: {
        id: string;
        type: string;
        action: string;
        details: string;
        time: Date;
        status: string;
    }[];
    recentCourses: RecentCourse[];
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

    useEffect(() => {
        getAdminDashboardStats().then(res => {
            if (res.success && res.data) setData(res.data as DashboardData);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-[#006a6a]" />
            </div>
        );
    }

    // Build chart data based on toggle
    const monthlyChart = data?.revenueChart ?? [];
    const weeklyChart = data?.weeklyChart ?? [];
    const chartData = chartView === "weekly" ? weeklyChart : monthlyChart;

    // Format revenue display
    const totalRev = data?.totalRevenue ?? 0;
    const revDisplay =
        totalRev >= 1_000_000
            ? `₦${(totalRev / 1_000_000).toFixed(1)}M`
            : totalRev >= 1_000
            ? `₦${(totalRev / 1_000).toFixed(0)}K`
            : `₦${totalRev.toLocaleString()}`;

    return (
        <div className="space-y-7 animate-in fade-in duration-500">

            {/* ── Stat Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    icon={<Users className="w-5 h-5 text-[#006a6a]" />}
                    label="Total Users"
                    value={(data?.totalUsers ?? 0).toLocaleString()}
                    trend={`${(data?.trends?.users ?? 0) > 0 ? '+' : ''}${(data?.trends?.users ?? 0).toFixed(1)}% from last month`}
                    trendUp={(data?.trends?.users ?? 0) >= 0}
                />
                <StatCard
                    icon={<BookOpen className="w-5 h-5 text-[#006a6a]" />}
                    label="Active Courses"
                    value={`${data?.totalCourses ?? 0}`}
                    trend={`${data?.trends?.coursesLast30 ?? 0} new additions this month`}
                    trendUp={(data?.trends?.courses ?? 0) >= 0}
                />
                <StatCard
                    icon={<DollarSign className="w-5 h-5 text-[#006a6a]" />}
                    label="Total Revenue"
                    value={revDisplay}
                    trend={`${(data?.trends?.revenue ?? 0) > 0 ? '+' : ''}${(data?.trends?.revenue ?? 0).toFixed(1)}% from last month`}
                    trendUp={(data?.trends?.revenue ?? 0) >= 0}
                />
            </div>

            {/* ── Chart + Right Panel ─────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Learner Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Learner Growth Trends</h2>
                        </div>
                        {/* Weekly / Monthly Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            {(["weekly", "monthly"] as const).map(v => (
                                <button
                                    key={v}
                                    onClick={() => setChartView(v)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                                        chartView === v
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {chartData.some(d => d.revenue > 0) ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} barCategoryGap="35%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                                    width={48}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,106,106,0.05)", radius: 6 }}
                                    formatter={((v: number) => [`₦${v.toLocaleString()}`, "Revenue"]) as never}
                                    contentStyle={{
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#006a6a"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No revenue data yet</p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Quick Actions + System Health */}
                <div className="space-y-5">
                    {/* Quick Actions */}
                    <div className="bg-[#1a2e44] rounded-2xl p-5 text-white shadow-xl shadow-[#1a2e44]/15">
                        <h3 className="font-bold text-sm mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/admin/users"
                                className="group flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded p-4 transition-all duration-200"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-[#006a6a] transition-colors">
                                    <UserPlus className="w-4.5 h-4.5 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-white/90 text-center leading-tight">Add User</span>
                            </Link>
                            <Link
                                href="/admin/courses"
                                className="group flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded p-4 transition-all duration-200"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-[#006a6a] transition-colors">
                                    <Upload className="w-4.5 h-4.5 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-white/90 text-center leading-tight">Upload Content</span>
                            </Link>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-sm text-gray-900 mb-4">System Health</h3>
                        <div className="space-y-4">
                            <HealthMetric label="API Latency" value="24ms" percent={24} color="#006a6a" />
                            <HealthMetric label="Storage Load" value="64%" percent={64} color="#f5c518" />
                            <div className="pt-2 border-t border-gray-50 space-y-2">
                                {[["Database", "Operational"], ["API Gateway", "Operational"], ["Storage", "Operational"]].map(([name, status]) => (
                                    <div key={name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs text-gray-500">{name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-500">{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity (compact) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-sm text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                            {data?.activityFeed?.length ? data.activityFeed.slice(0, 5).map(item => (
                                <div key={item.id} className="px-4 py-3 hover:bg-gray-50/80 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.type === "payment" ? "bg-emerald-500" : "bg-[#006a6a]"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800">{item.action}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{item.details}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-4 py-6 text-center text-gray-400">
                                    <Activity className="w-6 h-6 mx-auto mb-1 opacity-30" />
                                    <p className="text-xs">No recent activity</p>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/40">
                            <Link href="/admin/payments" className="flex items-center justify-center gap-1 text-xs font-semibold text-[#006a6a] hover:text-[#005555] transition-colors">
                                View All Payments <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content Pipeline ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Content Pipeline</h2>
                    <Link
                        href="/admin/courses"
                        className="text-sm font-semibold text-[#006a6a] hover:text-[#005555] transition-colors flex items-center gap-1"
                    >
                        View All Management <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/60 border-b border-gray-100">
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Title</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.recentCourses?.length ? data.recentCourses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50/60 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#006a6a]/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-[#006a6a]" />
                                            </div>
                                            <span className="font-semibold text-sm text-gray-900 line-clamp-1">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{course.instructor}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={course.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {course.enrollment.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/courses/${course.id}`}
                                                className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                                title="Edit"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                                        No courses found.
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

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    trend,
    trendUp,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: string;
    trendUp?: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <div className="p-2 rounded-xl bg-[#006a6a]/8">{icon}</div>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{value}</h3>
            <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-[#006a6a]" : "text-red-500"}`}>
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>{trend}</span>
            </div>
        </div>
    );
}

function HealthMetric({
    label,
    value,
    percent,
    color,
}: {
    label: string;
    value: string;
    percent: number;
    color: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-bold text-gray-900">{value}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: "published" | "draft" }) {
    if (status === "published") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle className="w-3 h-3" />
                ACTIVE
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
            <Clock className="w-3 h-3" />
            DRAFT
        </span>
    );
}
