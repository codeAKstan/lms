"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Eye, X, Tag, UploadCloud } from "lucide-react";
import Link from "next/link";
import { createBlog, updateBlog, getBlogs, getUserByEmail } from "@/actions/admin/blog";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadFile, getAllowedTypes, getMaxSize } from "@/lib/upload";
import Image from "next/image";

const CATEGORIES = [
    "Climate", "Renewable Energy", "Technology", "Education", "Policy", "Sustainability", "Innovation", "News"
];

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogEditorPage() {
    const router = useRouter();
    const { session } = useAuth();
    const params = useParams();
    const blogId = params?.blogId as string | undefined;
    const isEdit = !!blogId;

    const [saving, setSaving] = useState(false);
    const [loadingPost, setLoadingPost] = useState(isEdit);
    const [tagInput, setTagInput] = useState("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        status: "draft" as "draft" | "published" | "scheduled",
        featuredImage: "",
        seoTitle: "",
        seoDescription: "",
        tags: [] as string[],
        featured: false,
        scheduledAt: "",
    });

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            setLoadingPost(true);
            const res = await getBlogs({ page: 1, limit: 100 });
            if (res.success && res.data) {
                const post = res.data.blogs.find(b => b.id === blogId);
                if (post) {
                    setForm({
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        category: post.category || "",
                        status: post.status,
                        featuredImage: post.featuredImage || "",
                        seoTitle: post.seoTitle || "",
                        seoDescription: post.seoDescription || "",
                        tags: post.tags,
                        featured: post.featured,
                        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
                    });
                }
            }
            setLoadingPost(false);
        })();
    }, [blogId, isEdit]);

    const handleChange = (field: keyof typeof form, value: string | boolean | string[]) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "title" && !isEdit) {
                updated.slug = slugify(value as string);
            }
            return updated;
        });
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !form.tags.includes(tag)) {
            handleChange("tags", [...form.tags, tag]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        handleChange("tags", form.tags.filter(t => t !== tag));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            toast.loading("Uploading featured image...", { id: "blog-image" });
            const result = await uploadFile(file, {
                bucket: "blog-assets",
                allowedTypes: getAllowedTypes('image'),
                maxSize: getMaxSize('image')
            });
            handleChange("featuredImage", result.url);
            toast.success("Image uploaded successfully!", { id: "blog-image" });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error instanceof Error ? error.message : "Upload failed", { id: "blog-image" });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (status?: "draft" | "published") => {
        if (!form.title.trim() || !form.slug.trim()) {
            return toast.error("Title and slug are required");
        }
        if (!session?.user?.id) {
            return toast.error("You must be logged in");
        }

        setSaving(true);
        const payload = { ...form, status: status || form.status };

        let res;
        if (isEdit) {
            res = await updateBlog(blogId!, payload);
        } else {
            if (!session?.user?.email) {
                setSaving(false);
                return toast.error("User email not found");
            }
            const userRes = await getUserByEmail(session.user.email);
            if (!userRes.success || !userRes.data) {
                setSaving(false);
                return toast.error("User not found in database");
            }
            res = await createBlog({ ...payload, authorId: userRes.data.id });
        }

        setSaving(false);
        if (res.success) {
            toast.success(isEdit ? "Post updated" : "Post created");
            router.push("/admin/blog");
        } else {
            toast.error(res.error || "Failed to save post");
        }
    };

    if (loadingPost) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/blog"
                        className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? "Edit Post" : "New Blog Post"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEdit ? `Editing: ${form.title}` : "Compose and publish a new blog post"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSubmit("draft")}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSubmit("published")}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:-translate-y-0.5 shadow-lg disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        Publish
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Title *</label>
                            <input
                                type="text"
                                placeholder="Enter a compelling title..."
                                value={form.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-lg font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Slug *</label>
                            <input
                                type="text"
                                placeholder="url-friendly-slug"
                                value={form.slug}
                                onChange={(e) => handleChange("slug", slugify(e.target.value))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none font-mono text-sm"
                            />
                            <p className="text-xs text-gray-400">Preview: /blog/{form.slug || "your-slug"}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Excerpt</label>
                            <textarea
                                rows={2}
                                placeholder="Brief summary shown in lists and search results..."
                                value={form.excerpt}
                                onChange={(e) => handleChange("excerpt", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none resize-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Content *</label>
                        <textarea
                            rows={20}
                            placeholder="Write your blog post content here... (Markdown supported)"
                            value={form.content}
                            onChange={(e) => handleChange("content", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none resize-none text-sm font-mono leading-relaxed"
                        />
                        <p className="text-xs text-gray-400">{form.content.length} characters</p>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">SEO Settings</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">SEO Title</label>
                            <input
                                type="text"
                                placeholder="Override title for search engines (optional)"
                                value={form.seoTitle}
                                onChange={(e) => handleChange("seoTitle", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">SEO Description</label>
                            <textarea
                                rows={2}
                                placeholder="Override excerpt for search engine description (optional)"
                                value={form.seoDescription}
                                onChange={(e) => handleChange("seoDescription", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none resize-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Publish Settings */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <h3 className="font-semibold text-gray-900">Publish Settings</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>
                        {form.status === "scheduled" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Schedule Date</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduledAt}
                                    onChange={(e) => handleChange("scheduledAt", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-sm"
                                />
                            </div>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => handleChange("featured", e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Featured Post</span>
                                <p className="text-xs text-gray-400">Show prominently on homepage</p>
                            </div>
                        </label>
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-sm"
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Add a tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-3 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {tag}
                                    <button onClick={() => removeTag(tag)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Featured Image</h3>
                            <p className="text-xs text-gray-400 mt-1">Upload a cover image for this blog post</p>
                        </div>
                        
                        {form.featuredImage ? (
                            <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                                <Image src={form.featuredImage} alt="Featured" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleChange("featuredImage", "")}
                                        className="p-2 bg-white/20 hover:bg-red-500 rounded-full backdrop-blur-sm text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group"
                            >
                                <div className="p-3 bg-gray-50 group-hover:bg-white rounded-full mb-3 shadow-sm transition-colors">
                                    {isUploadingImage ? (
                                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                    ) : (
                                        <UploadCloud className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {isUploadingImage ? "Uploading..." : "Click to upload"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
