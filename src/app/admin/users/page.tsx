"use client";

import { Search, Shield, Ban, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getUsers, toggleUserBan, updateUserRole, UserResult } from "@/actions/admin/users";
import { toast } from "sonner";

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getUsers({
                page,
                limit: 10,
                search: debouncedSearch,
                role: roleFilter,
            });
            setUsers(result.users);
            setTotalPages(result.totalPages);
            setTotalUsers(result.total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter]);

    const handleToggleBan = async (userId: string, currentStatus: "active" | "banned") => {
        const newStatus = currentStatus === "active" ? true : false; // true = ban, false = unban
        const action = newStatus ? "banning" : "unbanning";

        const promise = toggleUserBan(userId, newStatus);

        toast.promise(promise, {
            loading: `${newStatus ? "Banning" : "Unbanning"} user...`,
            success: () => {
                fetchUsers();
                return `User ${newStatus ? "banned" : "unbanned"} successfully`;
            },
            error: `Failed during ${action}`,
        });
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const promise = updateUserRole(userId, newRole);

        toast.promise(promise, {
            loading: "Updating role...",
            success: () => {
                fetchUsers();
                return "User role updated successfully";
            },
            error: "Failed to update user role",
        });
    };

    const handleExportCSV = () => {
        if (!users || users.length === 0) return toast.error("No users to export");
        const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date", "Courses Enrolled", "Courses Created"];
        const rows = users.map(u => [
            u.id,
            `"${u.name.replace(/"/g, '""')}"`,
            u.email,
            u.role,
            u.status,
            new Date(u.createdAt).toISOString(),
            u.coursesEnrolled,
            u.coursesCreated
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Users</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    {["all", "student", "instructor"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${roleFilter === role
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Joined Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                        <p>Loading users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`pl-3 pr-7 py-1 rounded-full text-xs font-medium cursor-pointer outline-none hover:opacity-80 transition-opacity appearance-none capitalize bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')] bg-[position:calc(100%-6px)_center] ${user.role === "instructor"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-100"
                                                    : user.role === "admin"
                                                        ? "bg-gray-800 text-white border border-gray-900"
                                                        : "bg-blue-50 text-blue-700 border border-blue-100"
                                                    }`}
                                            >
                                                <option value="student" className="text-gray-900 bg-white">Student</option>
                                                <option value="instructor" className="text-gray-900 bg-white">Instructor</option>
                                                <option value="admin" className="text-gray-900 bg-white">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                                            {user.role === "instructor"
                                                ? `${user.coursesCreated} courses`
                                                : `${user.coursesEnrolled} enrolled`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "active"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                                {user.status === "active" ? "Active" : "Banned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user.status === "active" ? (
                                                    <button
                                                        onClick={() => handleToggleBan(user.id, "active")}
                                                        className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-gray-500 hover:text-rose-600"
                                                        title="Ban User"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleBan(user.id, "banned")}
                                                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-gray-500 hover:text-emerald-600"
                                                        title="Unban User"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * 10, totalUsers)}</span> of <span className="font-medium text-gray-900">{totalUsers}</span> users
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
