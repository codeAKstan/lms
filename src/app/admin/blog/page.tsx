"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Plus, Search, Eye, Edit, FileText, Clock, Loader2, Trash2, Star, TrendingUp, MoreHorizontal
} from "lucide-react";
import {
    getBlogs, deleteBlog, toggleBlogFeatured, changeBlogStatus, BlogPost
} from "@/actions/admin/blog";
import { toast } from "sonner";

const CATEGORIES = [
    "Climate", "Renewable Energy", "Technology", "Education", "Policy", "Sustainability", "Innovation", "News"
];

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getBlogs({
                page,
                limit: 10,
                search: searchQuery,
                status: (statusFilter || "all") as "all" | "draft" | "published" | "scheduled",
            });
            if (res.success && res.data) {
                let blogs = res.data.blogs;
                if (categoryFilter) {
                    blogs = blogs.filter(b => b.category === categoryFilter);
                }
                setPosts(blogs);
                setTotalPages(res.data.totalPages);
                setTotalPosts(res.data.total);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch blog posts");
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, statusFilter, categoryFilter]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;
        const res = await deleteBlog(id);
        if (res.success) {
            toast.success("Post deleted");
            fetchPosts();
        } else {
            toast.error(res.error || "Failed to delete post");
        }
    };

    const handleToggleFeatured = async (id: string, current: boolean) => {
        const res = await toggleBlogFeatured(id, !current);
        if (res.success) {
            toast.success(current ? "Removed from featured" : "Marked as featured");
            fetchPosts();
        } else {
            toast.error("Failed to update");
        }
    };

    const handleStatusChange = async (id: string, newStatus: "draft" | "published") => {
        const res = await changeBlogStatus(id, newStatus);
        if (res.success) {
            toast.success(`Post ${newStatus === "published" ? "published" : "moved to draft"}`);
            fetchPosts();
        } else {
            toast.error("Failed to update status");
        }
    };

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-800 border-gray-200",
            scheduled: "bg-blue-50 text-blue-700 border-blue-100",
            published: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
        return styles[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "draft": return <Edit className="h-3 w-3" />;
            case "scheduled": return <Clock className="h-3 w-3" />;
            case "published": return <Eye className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    };

    const publishedCount = posts.filter(p => p.status === "published").length;
    const draftCount = posts.filter(p => p.status === "draft").length;
    const totalViews = posts.reduce((acc, p) => acc + p.views, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex justify-end gap-4">
                <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded hover:-translate-y-0.5 shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Post
                </Link>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                {[
                    { label: "Total Posts", value: totalPosts, icon: <FileText className="w-5 h-5 text-blue-600" />, sub: `${publishedCount} published`, bg: "bg-blue-50" },
                    { label: "Published", value: publishedCount, icon: <Eye className="w-5 h-5 text-emerald-600" />, sub: "live posts", bg: "bg-emerald-50" },
                    { label: "Drafts", value: draftCount, icon: <Edit className="w-5 h-5 text-amber-600" />, sub: "pending posts", bg: "bg-amber-50" },
                    { label: "Total Views", value: totalViews.toLocaleString(), icon: <TrendingUp className="w-5 h-5 text-purple-600" />, sub: "lifetime views", bg: "bg-purple-50" },
                ].map(({ label, value, icon, sub, bg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className={`${bg} p-2.5 rounded-xl inline-flex mb-4`}>{icon}</div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts by title or excerpt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                {["Post", "Status", "Category", "Views", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                        <p>Loading posts...</p>
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No blog posts found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchQuery || statusFilter || categoryFilter
                                                ? "Try adjusting your filters"
                                                : "Create your first post to get started"}
                                        </p>
                                        {!searchQuery && !statusFilter && !categoryFilter && (
                                            <Link
                                                href="/admin/blog/new"
                                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create First Post
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-start gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                                                        {post.featured && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.excerpt}</p>
                                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                                        {post.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusStyle(post.status)}`}>
                                                {getStatusIcon(post.status)} {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {post.category || "Uncategorized"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {post.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900"
                                                    title="View Post"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/blog/${post.id}`}
                                                    className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900"
                                                    title="Edit Post"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                {/* More dropdown */}
                                                <div className="relative group/more">
                                                    <button
                                                        className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-900"
                                                        title="More options"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-[160px] opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleToggleFeatured(post.id, post.featured)}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                                            >
                                                                <Star className="w-3.5 h-3.5 inline mr-2" />
                                                                {post.featured ? "Remove Featured" : "Make Featured"}
                                                            </button>
                                                            {post.status === "draft" && (
                                                                <button
                                                                    onClick={() => handleStatusChange(post.id, "published")}
                                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 inline mr-2" />
                                                                    Publish Now
                                                                </button>
                                                            )}
                                                            {post.status === "published" && (
                                                                <button
                                                                    onClick={() => handleStatusChange(post.id, "draft")}
                                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5 inline mr-2" />
                                                                    Move to Draft
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-sm text-rose-600"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 inline mr-2" />
                                                                Delete Post
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <p className="text-sm text-gray-500">
                            Page <span className="font-medium text-gray-900">{page}</span> of{" "}
                            <span className="font-medium text-gray-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
