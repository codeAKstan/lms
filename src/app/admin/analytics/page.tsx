"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, BookOpen, TrendingUp, Download, Loader2 } from "lucide-react";
import { getAdminAnalytics } from "@/actions/admin/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AnalyticsData = {
    totalUsers: number;
    totalEnrollments: number;
    totalRevenue: number;
    topCourses: { rank: number; name: string; enrollments: number }[];
    revenueChart: { month: string; revenue: number }[];
};

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAdminAnalytics().then(res => {
            if (res.success && res.data) setData(res.data as AnalyticsData);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const maxEnroll = Math.max(...(data?.topCourses.map(c => c.enrollments) ?? [1]), 1);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex justify-end gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded shadow-lg hover:-translate-y-0.5 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                </button>
            </div>

            {/* KPIs */}
            <div className="grid md:grid-cols-3 gap-6">
                <KPICard icon={<DollarSign className="w-5 h-5 text-emerald-600" />} label="Total Revenue" value={`₦${(data?.totalRevenue ?? 0).toLocaleString()}`} bg="bg-emerald-50" />
                <KPICard icon={<Users className="w-5 h-5 text-blue-600" />} label="Total Users" value={(data?.totalUsers ?? 0).toLocaleString()} bg="bg-blue-50" />
                <KPICard icon={<BookOpen className="w-5 h-5 text-purple-600" />} label="Total Enrollments" value={(data?.totalEnrollments ?? 0).toLocaleString()} bg="bg-purple-50" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trends (Last 12 Months)</h3>
                    {data?.revenueChart.some(m => m.revenue > 0) ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.revenueChart} barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={((v: number) => [`₦${v.toLocaleString()}`, "Revenue"]) as never} contentStyle={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "12px", fontSize: "13px" }} />
                                <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No revenue data yet</p>
                        </div>
                    )}
                </div>

                {/* Top Courses */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Courses by Enrollment</h3>
                    {data?.topCourses.length ? (
                        <div className="space-y-5">
                            {data.topCourses.map(course => (
                                <div key={course.rank}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">#{course.rank}</span>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{course.name}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500">{course.enrollments}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-gray-900 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${(course.enrollments / maxEnroll) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No course data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-4`}>{icon}</div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    );
}
