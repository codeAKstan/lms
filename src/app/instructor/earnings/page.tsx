"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getInstructorEarnings } from "@/actions/instructor/earnings";
import { toast } from "sonner";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Loader2,
    ArrowUpRight,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

type EarningsData = {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    transactionCount: number;
    monthlyChart: { month: string; revenue: number }[];
    transactions: {
        id: string;
        studentName: string;
        studentEmail: string;
        courseName: string;
        amount: number;
        currency: string;
        date: Date;
    }[];
};

export default function InstructorEarningsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<EarningsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        async function fetchEarnings() {
            try {
                const res = await getInstructorEarnings(user!.id);
                if (res.success && res.data) {
                    setData(res.data as EarningsData);
                } else {
                    toast.error("Failed to load earnings data");
                }
            } catch {
                toast.error("An error occurred");
            } finally {
                setIsLoading(false);
            }
        }
        fetchEarnings();
    }, [user]);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const monthChange = data.lastMonthRevenue > 0
        ? ((data.thisMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100
        : data.thisMonthRevenue > 0 ? 100 : 0;
    const isUp = monthChange >= 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Lifetime</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{data.totalRevenue.toLocaleString()}</p>
                </div>

                {/* This Month */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${isUp ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                            <ArrowUpRight className={`w-3 h-3 mr-1 ${!isUp && 'rotate-180'}`} />
                            {Math.abs(monthChange).toFixed(0)}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">₦{data.thisMonthRevenue.toLocaleString()}</p>
                </div>

                {/* Last Month */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Previous</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Month</p>
                    <p className="text-2xl font-bold text-gray-900">₦{data.lastMonthRevenue.toLocaleString()}</p>
                </div>

                {/* Total Sales */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">All time</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{data.transactionCount}</p>
                </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue (Last 6 Months)</h2>
                {data.monthlyChart.some(m => m.revenue > 0) ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data.monthlyChart} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#9ca3af" }}
                                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={((value: number) => [`₦${value.toLocaleString()}`, "Revenue"]) as never}
                                contentStyle={{
                                    background: "#fff",
                                    border: "1px solid #f0f0f0",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                                    fontSize: "13px"
                                }}
                            />
                            <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <DollarSign className="w-10 h-10 mb-2 opacity-30" />
                        <p className="font-medium">No revenue in the last 6 months</p>
                        <p className="text-sm mt-1">Publish a course and make your first sale</p>
                    </div>
                )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                    <p className="text-sm text-gray-400 mt-1">Most recent 50 completed payments</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.transactions.length > 0 ? data.transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-sm text-gray-900">{tx.studentName}</p>
                                        <p className="text-xs text-gray-400">{tx.studentEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 max-w-[200px] line-clamp-1">{tx.courseName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(tx.date), "dd MMM yyyy")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-emerald-600">
                                            ₦{tx.amount.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="font-medium text-gray-500">No transactions yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Payments will appear here once students purchase your courses</p>
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
