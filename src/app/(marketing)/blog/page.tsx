/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, Tag, Loader2, BookOpen } from "lucide-react";
import { getPublishedBlogs } from "@/actions/admin/blog";

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    category: string | null;
    tags: string[];
    featured: boolean;
    views: number;
    createdAt: Date;
    author: { name: string };
};

const CATEGORIES = [
    "All", "Climate", "Renewable Energy", "Technology", "Education", "Policy", "Sustainability", "Innovation", "News"
];

export default function BlogPage() {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await getPublishedBlogs({
                search: search || undefined,
                category: category !== "All" ? category : undefined,
            });
            if (res.success && res.data) {
                setPosts(res.data as Blog[]);
            }
            setLoading(false);
        })();
    }, [search, category]);

    const featured = posts.filter(p => p.featured).slice(0, 1)[0];
    const rest = posts.filter(p => !p.featured || p !== featured);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Hero */}
            <section className="bg-teal-50 border-b border-gray-200 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-teal-600 rounded-full text-sm font-bold text-teal-700 mb-6">
                        <BookOpen className="w-4 h-4" />
                        Insights & Resources
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
                        Clean Tech Hub Blog
                    </h1>
                    <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
                        Stay informed with the latest insights on renewable energy, sustainability, and clean technology education.
                    </p>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded font-bold text-sm whitespace-nowrap transition-all border ${category === cat
                                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No articles found</h2>
                        <p className="text-gray-500">
                            {search || category !== "All"
                                ? "Try adjusting your search or filter"
                                : "No blog posts have been published yet. Check back soon!"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post */}
                        {featured && !search && category === "All" && (
                            <div className="mb-12">
                                <Link href={`/blog/${featured.slug}`} className="group block">
                                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow bg-white">
                                        <div className="md:flex">
                                            {featured.featuredImage ? (
                                                <img
                                                    src={featured.featuredImage}
                                                    alt={featured.title}
                                                    className="md:w-1/2 h-64 md:h-auto object-cover"
                                                />
                                            ) : (
                                                <div className="md:w-1/2 h-64 md:h-auto min-h-[240px] bg-teal-50 flex items-center justify-center">
                                                    <BookOpen className="w-16 h-16 text-teal-200" />
                                                </div>
                                            )}
                                            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider rounded border border-yellow-200">
                                                        ★ Featured
                                                    </span>
                                                    {featured.category && (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded border border-gray-200">{featured.category}</span>
                                                    )}
                                                </div>
                                                <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors leading-tight">
                                                    {featured.title}
                                                </h2>
                                                <p className="text-gray-600 mb-6 line-clamp-3 text-lg">{featured.excerpt}</p>
                                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(featured.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                    </span>
                                                    <span>by {featured.author.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Post Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rest.map(post => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                                    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
                                        {post.featuredImage ? (
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                                                <BookOpen className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                {post.category && (
                                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 font-bold uppercase tracking-wider text-[10px] rounded">{post.category}</span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 flex-1">{post.excerpt}</p>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </div>
                                                {post.tags.length > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                                                        <Tag className="w-3.5 h-3.5" />
                                                        {post.tags[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
