"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, CreditCard, DollarSign, CheckCircle } from "lucide-react";
import { getAdminPayments } from "@/actions/admin/payments";
import { format } from "date-fns";
import { toast } from "sonner";

type Payment = {
    id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    amount: number;
    currency: string;
    gateway: string;
    status: string;
    gatewayReference: string | null;
    createdAt: Date;
};

type Stats = {
    totalRevenue: number;
    paystackRevenue: number;
    totalTransactions: number;
    completedCount: number;
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "COMPLETED" | "PENDING" | "FAILED">("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getAdminPayments({ page, search: searchQuery, status: statusFilter });
            if (res.success && res.data) {
                setPayments(res.data.payments as Payment[]);
                setStats(res.data.stats as Stats);
                setTotalPages(res.data.totalPages);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, searchQuery, statusFilter]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);
    useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);

    const statusColor: Record<string, string> = {
        COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
        FAILED: "bg-rose-50 text-rose-700 border border-rose-100",
    };

    const handleExportCSV = () => {
        if (!payments || payments.length === 0) return toast.error("No transactions to export");
        const headers = ["Transaction ID", "Student", "Email", "Course", "Amount", "Currency", "Gateway", "Status", "Date"];
        const rows = payments.map(p => [
            p.gatewayReference || p.id,
            `"${p.studentName.replace(/"/g, '""')}"`,
            p.studentEmail,
            `"${p.courseTitle.replace(/"/g, '""')}"`,
            (p.amount / 100).toFixed(2),
            p.currency,
            p.gateway,
            p.status,
            new Date(p.createdAt).toISOString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `payments_export_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-2.5 bg-emerald-50 rounded-xl inline-flex mb-4"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{(stats?.totalRevenue ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-2.5 bg-blue-50 rounded-xl inline-flex mb-4"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Paystack Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{(stats?.paystackRevenue ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-2.5 bg-purple-50 rounded-xl inline-flex mb-4"><CheckCircle className="w-5 h-5 text-purple-600" /></div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedCount ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-2.5 bg-gray-50 rounded-xl inline-flex mb-4"><RefreshCw className="w-5 h-5 text-gray-600" /></div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions ?? 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by student or course..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    />
                </div>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    {(["all", "COMPLETED", "PENDING", "FAILED"] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                {["Transaction ID", "Student", "Course", "Amount", "Gateway", "Status", "Date"].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="font-medium text-gray-500">No transactions found</p>
                                    </td>
                                </tr>
                            ) : payments.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-gray-400">{p.gatewayReference?.slice(0, 14) ?? p.id.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-sm text-gray-900">{p.studentName}</p>
                                        <p className="text-xs text-gray-400">{p.studentEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 max-w-[180px] truncate">{p.courseTitle}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            {p.amount === 0 ? "Free" : `₦${(p.amount / 100).toLocaleString()}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                                            {p.gateway}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                                            {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(p.createdAt), "dd MMM yyyy")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
