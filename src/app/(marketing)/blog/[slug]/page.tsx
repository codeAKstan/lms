"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Tag, Loader2, BookOpen, User } from "lucide-react";
import { getBlogBySlug, incrementBlogViews } from "@/actions/admin/blog";

type BlogDetail = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string | null;
    tags: string[];
    featured: boolean;
    featuredImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string };
};

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [post, setPost] = useState<BlogDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            setLoading(true);
            const res = await getBlogBySlug(slug);
            if (res.success && res.data) {
                setPost(res.data as BlogDetail);
                await incrementBlogViews((res.data as BlogDetail).id);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        })();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
                <p className="text-gray-500 mb-6">This article doesn&apos;t exist or has been removed.</p>
                <Link href="/blog" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                    ← Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-gray-50 border-b border-gray-100 py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {post.category && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                                {post.category}
                            </span>
                        )}
                        {post.featured && (
                            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-100">
                                ★ Featured
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
                    <p className="text-lg text-gray-500 mb-6">{post.excerpt}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> {post.author.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()} views
                        </span>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full rounded-2xl object-cover max-h-[500px]"
                    />
                </div>
            )}

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 py-10">
                <div
                    className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-emerald-600 prose-a:underline prose-img:rounded-xl"
                    style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem" }}
                >
                    {post.content}
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-400" />
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back CTA */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        More Articles
                    </Link>
                    <p className="text-xs text-gray-400">
                        Last updated: {new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>
            </article>
        </div>
    );
}
