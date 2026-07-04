"use client";

import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";

import { getPublishedBlogs } from "@/actions/admin/blog";

export interface HeroData {
    title?: string; subtitle?: string; description?: string;
    primaryBtnText?: string; primaryBtnLink?: string;
    secondaryBtnText?: string; secondaryBtnLink?: string;
    backgroundImage?: string | null;
}
export interface FocusAreaData { id: string; title: string; description: string; icon: string; color: string; }
export interface FaqData { id: string; question: string; answer: string; }

// --- Types for Blogs ---
type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    category: string | null;
    createdAt: string | Date;
    author?: { name: string };
};

// --- Types for Courses ---
type Course = {
    id: string;
    slug: string;
    title: string;
    description: string;
    category?: string;
    price: number;
    thumbnail?: string | null;
    instructor?: { name: string; avatar?: string | null };
};

export default function MarketingHomePage({ heroData, faqsData }: { heroData: HeroData | null; focusAreasData: FocusAreaData[]; faqsData: FaqData[] }) {
    return (
        <div className="bg-[#f7f9fb] min-h-screen font-sans text-[#191c1e]">
            <HeroSection heroData={heroData} />
            <FeaturedCoursesSection />
            <PathwaysSection />
            <SDGImpactSection />
            <TestimonialsSection />
            <BlogInsightsSection />
            <FaqSection faqsData={faqsData} />
            <CTABannerSection />
        </div>
    );
}

function HeroSection({ heroData }: { heroData: HeroData | null }) {
    return (
        <section className="relative pt-24 pb-48 flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={heroData?.backgroundImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop"}
                    alt="Solar panels at sunset"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00153e]/90 to-[#00153e]/40 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[#00153e]/30"></div>
            </div>

            <div className="container relative z-10 mx-auto px-6 md:px-12">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center rounded-full bg-[#b1c5ff] text-[#00153e] px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6">
                        Pioneering Sustainability
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {heroData?.title || "Africa's Climate Learning Platform"}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                        {heroData?.description || "Empowering the next generation of climate leaders with world-class education in clean technology, green finance, and sustainable policy."}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href={heroData?.primaryBtnLink || "/register"} className="bg-[#ffcc00] hover:bg-[#e6b800] text-[#00153e] font-bold py-3 px-8 rounded-md transition-colors">
                            {heroData?.primaryBtnText || "Start Learning"}
                        </Link>
                        <Link href={heroData?.secondaryBtnLink || "/learning-paths"} className="bg-transparent border border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded-md transition-colors">
                            {heroData?.secondaryBtnText || "Explore Pathways"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Overlapping Category Icons Row */}
            <div className="absolute -bottom-16 left-0 right-0 z-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { icon: Icons.Zap, label: "Renewable Energy" },
                            { icon: Icons.Leaf, label: "Climate Policy" },
                            { icon: Icons.Banknote, label: "Green Finance" },
                            { icon: Icons.Globe, label: "Sustainability" },
                        ].map((cat, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-[0_0_30px_rgba(9,41,98,0.12)] p-6 flex flex-col items-center justify-center text-center gap-4 transition-transform hover:-translate-y-1 cursor-pointer border border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-[#90efef] flex items-center justify-center text-[#006e6e]">
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-[#191c1e] text-sm">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturedCoursesSection() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/courses?sort=trending&limit=3");
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch featured courses:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Fallback images matching the mockup in case a course has no thumbnail
    const mockupThumbnails = [
        "/mockup-assets/course_solar.png",
        "/mockup-assets/course_finance.png",
        "/mockup-assets/course_wind.png"
    ];

    return (
        <section className="pt-32 pb-20 bg-[#f7f9fb]">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-[#191c1e] mb-1">Featured Courses</h2>
                        <p className="text-[#444650] text-sm">Expert-led sessions for industry professionals</p>
                    </div>
                    <Link href="/courses" className="text-[#006a6a] font-bold text-sm hover:underline flex items-center gap-1">
                        View All Courses <Icons.ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-white border border-gray-200 rounded-xl animate-pulse flex flex-col">
                                <div className="h-48 bg-gray-100 rounded-t-xl w-full"></div>
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && courses.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                        <Icons.BookOpen className="w-8 h-8 mx-auto text-[#006a6a] mb-4" />
                        <h3 className="text-lg font-bold text-[#191c1e] mb-2">Check back soon!</h3>
                        <p className="text-[#444650] max-w-md mx-auto text-sm">Our team is preparing new featured courses. They will appear here once published.</p>
                    </div>
                )}

                {!loading && courses.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {courses.map((course, index) => {
                            // Map category styles roughly based on name or index
                            let catStyle = "bg-[#90efef] text-[#006e6e]"; // Default Engineering/Tech
                            if (course.category?.toLowerCase().includes("business") || course.category?.toLowerCase().includes("finance")) {
                                catStyle = "bg-[#b1c5ff] text-[#00153e]";
                            }

                            return (
                                <Link href={`/courses/${course.slug}`} key={course.id} className="group">
                                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <Image 
                                                src={course.thumbnail || mockupThumbnails[index % mockupThumbnails.length]} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                                alt={course.title} 
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className={`${catStyle} text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm`}>
                                                    {course.category || "General"}
                                                </span>
                                                <span className={`font-bold text-sm ${course.price === 0 ? "text-[#006a6a]" : "text-[#191c1e]"}`}>
                                                    {course.price === 0 ? "FREE" : `$${(course.price / 100).toFixed(0)}`}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-[#191c1e] mb-2 leading-tight group-hover:text-[#006a6a] transition-colors">{course.title}</h3>
                                            <p className="text-[#444650] text-sm mb-6 flex-grow line-clamp-2">{course.description}</p>
                                            <div className="flex items-center gap-3 mt-auto">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                                                    <Image 
                                                        src={course.instructor?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"} 
                                                        fill 
                                                        className="object-cover" 
                                                        alt="Instructor" 
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-[#191c1e]">{course.instructor?.name || "Instructor"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

function PathwaysSection() {
    return (
        <section className="py-20 bg-[#f7f9fb]">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <h2 className="text-center text-sm font-bold text-[#444650] uppercase tracking-wider mb-10">Professional Pathways</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card 1 */}
                    <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-80">
                        <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop" fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Corporate Leader" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00153e]/90 via-[#00153e]/60 to-transparent"></div>
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h3 className="text-2xl font-bold text-white mb-3">ESG Corporate Leader</h3>
                            <p className="text-white/80 text-sm mb-6 max-w-md">A rigorous track for executives aiming to integrate ESG principles into corporate strategy and operations.</p>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-white/30">8 Courses</span>
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-white/30">Certification</span>
                                </div>
                                <span className="text-white font-bold text-sm flex items-center gap-1 group-hover:underline">Explore Path <Icons.ChevronRight className="w-4 h-4" /></span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-80">
                        <Image src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Tech Expert" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#006a6a]/90 via-[#006a6a]/60 to-transparent"></div>
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h3 className="text-2xl font-bold text-white mb-3">Renewable Tech Expert</h3>
                            <p className="text-white/80 text-sm mb-6 max-w-md">Deep dive into engineering, project management, and deployment of clean energy infrastructure across the continent.</p>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-white/30">12 Courses</span>
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-white/30">Lab Projects</span>
                                </div>
                                <span className="text-white font-bold text-sm flex items-center gap-1 group-hover:underline">Explore Path <Icons.ChevronRight className="w-4 h-4" /></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SDGImpactSection() {
    return (
        <section className="py-24 bg-[#00153e] text-white">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left Intro */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Driving SDG Impact</h2>
                        <p className="text-[#b1c5ff] text-base mb-12 max-w-md">
                            Our curriculum is directly mapped to the UN Sustainable Development Goals, ensuring every learner contributes to a better future.
                        </p>
                        
                        {/* Climate Action Card */}
                        <div className="bg-[#092962] rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                            <div className="w-10 h-10 bg-[#4CAF50] rounded-sm flex items-center justify-center font-bold text-white mb-6">13</div>
                            <h3 className="text-xl font-bold mb-3">Climate Action</h3>
                            <p className="text-white/70 text-sm leading-relaxed mb-12 relative z-10">
                                We focus on urgent action to combat climate change and its impacts through education and local innovation deployment.
                            </p>
                            
                            {/* Decorative blocks */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end px-8 gap-2 opacity-80">
                                <div className="h-6 w-1/4 bg-white/10 rounded-t-sm"></div>
                                <div className="h-8 w-1/4 bg-white/20 rounded-t-sm"></div>
                                <div className="h-10 w-1/4 bg-white/30 rounded-t-sm"></div>
                                <div className="h-12 w-1/4 bg-[#4CAF50] rounded-t-sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Affordable Energy Card */}
                        <div className="bg-[#ffcc00] rounded-2xl p-8 text-[#00153e] md:col-span-2 relative overflow-hidden">
                            <div className="w-10 h-10 border-2 border-[#00153e] rounded-sm flex items-center justify-center font-bold mb-6 relative z-10">7</div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">Affordable & Clean Energy</h3>
                            <p className="text-[#00153e]/80 text-sm leading-relaxed max-w-sm relative z-10">
                                Training technicians to maintain off-grid solar systems for rural communities.
                            </p>
                            <Icons.Lightbulb className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-[#00153e]" />
                        </div>

                        {/* Clean Water Card */}
                        <div className="bg-[#90efef] rounded-2xl p-8 text-[#006e6e]">
                            <div className="w-8 h-8 border-2 border-[#006e6e] rounded-sm flex items-center justify-center font-bold mb-4 text-xs">6</div>
                            <h3 className="text-lg font-bold mb-2">Clean Water & Sanitation</h3>
                            <p className="text-[#006e6e]/80 text-xs leading-relaxed">
                                Solar-powered irrigation and filtration training programs.
                            </p>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-[#00153e] border border-white/20 rounded-2xl p-8 flex flex-col justify-center">
                            <p className="text-[#b1c5ff] text-xs font-bold uppercase tracking-wider mb-6">Our impact since 2021</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-3xl font-bold text-[#ffcc00] mb-1">15k+</div>
                                    <div className="text-xs text-white/70">Students trained</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[#90efef] mb-1">40+</div>
                                    <div className="text-xs text-white/70">Countries reached</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    return (
        <section className="py-24 bg-[#f7f9fb]">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <h2 className="text-center text-sm font-bold text-[#444650] uppercase tracking-wider mb-12">Voices of the Hub</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex gap-1 mb-6">
                            {[1,2,3,4,5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
                        </div>
                        <p className="text-[#444650] text-sm italic leading-relaxed mb-8 flex-grow">
                            &ldquo;The Green Finance course changed how we approach project funding. The knowledge is practical and immediately applicable to our market.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                <Image src="https://images.unsplash.com/photo-1531123897727-8f129e1bfcc9?q=80&w=100&auto=format&fit=crop" fill className="object-cover" alt="Student" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#191c1e]">Kemi Adeyemi</h4>
                                <p className="text-xs text-[#444650]">Investment Analyst, Nigeria</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex gap-1 mb-6">
                            {[1,2,3,4,5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
                        </div>
                        <p className="text-[#444650] text-sm italic leading-relaxed mb-8 flex-grow">
                            &ldquo;EcoLearn is a bridge between theory and the reality of deploying clean energy in sub-Saharan Africa. Truly world-class content.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                <Image src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=100&auto=format&fit=crop" fill className="object-cover" alt="Student" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#191c1e]">David Mwangi</h4>
                                <p className="text-xs text-[#444650]">Solar Engineer, Kenya</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex gap-1 mb-6">
                            {[1,2,3,4,5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
                        </div>
                        <p className="text-[#444650] text-sm italic leading-relaxed mb-8 flex-grow">
                            &ldquo;As a policymaker, I found the data-driven approach of the Climate Policy track invaluable for drafting our new environmental bill.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                <Image src="https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=100&auto=format&fit=crop" fill className="object-cover" alt="Student" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#191c1e]">Fatoumata Diallo</h4>
                                <p className="text-xs text-[#444650]">Policy Director, Senegal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Blog & FAQ (Retained) ──────────────────────────────────────────────

function BlogInsightsSection() {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getPublishedBlogs({});
                if (res.success && res.data) {
                    setPosts(res.data.slice(0, 3) as Blog[]);
                }
            } catch (err) {
                console.error("Failed to fetch blogs:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-[#191c1e] mb-1">Latest Insights</h2>
                        <p className="text-[#444650] text-sm">Read about the latest trends in clean tech and sustainability</p>
                    </div>
                    <Link href="/blog" className="text-[#006a6a] font-bold text-sm hover:underline flex items-center gap-1">
                        View all articles <Icons.ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-white border border-gray-200 rounded-xl animate-pulse flex flex-col">
                                <div className="h-40 bg-gray-100 rounded-t-xl w-full"></div>
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                        <Icons.BookOpen className="w-8 h-8 mx-auto text-[#006a6a] mb-4" />
                        <h3 className="text-lg font-bold text-[#191c1e] mb-2">Check back soon!</h3>
                        <p className="text-[#444650] max-w-md mx-auto text-sm">Our editors are working on new clean tech insights. Articles will appear here once they are published.</p>
                    </div>
                )}

                {!loading && posts.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                                <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
                                    {post.featuredImage ? (
                                        <div className="relative h-40 w-full overflow-hidden">
                                            <Image src={post.featuredImage} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 bg-[#90efef]/30 flex items-center justify-center border-b border-gray-100">
                                            <span className="text-[#006e6e] font-bold">Article</span>
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="bg-[#b1c5ff] text-[#00153e] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                                                {post.category || "Article"}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-[#191c1e] mb-2 group-hover:text-[#006a6a] transition-colors line-clamp-2 leading-tight">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-[#444650] line-clamp-2 flex-grow mb-6">{post.excerpt}</p>
                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-[#f7f9fb] flex items-center justify-center text-[#006a6a] border border-gray-200">
                                                <Icons.User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-[#191c1e]">{post.author?.name || "EcoLearn Team"}</span>
                                                <span className="text-[10px] text-[#757781] flex items-center gap-1">
                                                    <Icons.Calendar className="w-3 h-3" />
                                                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function FaqSection({ faqsData }: { faqsData: FaqData[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-[#f7f9fb] border-t border-gray-200">
            <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-[#191c1e] mb-4">Frequently Asked Questions</h2>
                    <p className="text-sm text-[#444650]">Find answers to common questions about learning with EcoLearn Africa.</p>
                </div>
                
                <div className="space-y-3">
                    {faqsData && faqsData.length > 0 ? faqsData.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
                                <button 
                                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                >
                                    <span className="font-bold text-[#191c1e] text-sm pr-8">{faq.question}</span>
                                    {isOpen ? (
                                        <Icons.ChevronUp className="w-5 h-5 text-[#006a6a] flex-shrink-0" />
                                    ) : (
                                        <Icons.ChevronDown className="w-5 h-5 text-[#757781] flex-shrink-0" />
                                    )}
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-6 text-[#444650] text-sm leading-relaxed border-t border-gray-50 pt-4">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="text-center text-sm text-[#444650] py-8">
                            FAQs will be available shortly.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function CTABannerSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 md:px-12 max-w-5xl">
                <div className="bg-[#00153e] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to lead the climate revolution?</h2>
                        <p className="text-[#b1c5ff] text-base mb-10">
                            Join thousands of professionals across the continent building a sustainable future. Register today and get early access to our next cohort.
                        </p>
                        
                        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="flex-1 bg-white rounded-md px-4 py-3 text-[#191c1e] text-sm outline-none focus:ring-2 focus:ring-[#ffcc00]"
                                required
                            />
                            <button type="submit" className="bg-[#ffcc00] hover:bg-[#e6b800] text-[#00153e] font-bold py-3 px-6 rounded-md transition-colors text-sm whitespace-nowrap">
                                Create Free Account
                            </button>
                        </form>
                        <p className="text-white/50 text-xs italic">No credit card required for basic courses.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
