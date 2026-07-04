"use client";

import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
            <DonateBannerSection />
            <ImpactAtGlanceSection />
            <CorePillarsSection />
            <TextStreamSection />
            {/* <FeaturedCoursesSection /> */}
            {/* <PathwaysSection /> */}
            {/* <SDGImpactSection /> */}
            {/* <TestimonialsSection /> */}
            {/* <BlogInsightsSection /> */}
            {/* <FaqSection faqsData={faqsData} /> */}
            {/* <CTABannerSection /> */}
        </div>
    );
}

function DonateBannerSection() {
    return (
        <section className="bg-[#092963] pb-16 flex justify-center items-center">
            <Link 
                href="/donate" 
                className="group relative overflow-hidden bg-[#2da5cf] hover:bg-[#2092bc] text-white text-[15px] font-bold py-3.5 px-10 rounded-2xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center"
            >
                <span className="relative overflow-hidden inline-flex justify-center items-center">
                    <span className="inline-block transition-all duration-500 ease-in-out transform group-hover:-translate-y-[150%] group-hover:rotate-[-10deg] origin-top-left">
                        Donate
                    </span>
                    <span className="absolute inline-block transition-all duration-500 ease-in-out transform translate-y-[150%] rotate-[10deg] origin-bottom-left group-hover:translate-y-0 group-hover:rotate-0 whitespace-nowrap">
                        Donate
                    </span>
                </span>
            </Link>
        </section>
    );
}

function ImpactAtGlanceSection() {
    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-[#2da5cf] text-3xl md:text-[38px] font-bold mb-14 tracking-tight"
                >
                    Impact at Glance
                </motion.h2>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-[#f4c015] rounded-[2rem] p-10 flex flex-col items-center text-center text-white min-h-[360px] justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col items-center">
                            <Icons.Globe className="w-12 h-12 mb-6 text-white stroke-[1.5]" />
                            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                                40+ Clean<br />Energy Startups
                            </h3>
                        </div>
                        <p className="text-white/95 text-[15px] font-medium leading-relaxed max-w-[240px] mt-4">
                            Supported and incubated across Nigeria.
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="bg-[#f4c015] rounded-[2rem] p-10 flex flex-col items-center text-center text-white min-h-[360px] justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col items-center w-full">
                            <Icons.Layout className="w-12 h-12 mb-6 text-white stroke-[1.5]" />
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                                    290+ Students
                                </h3>
                                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                                    49+ Teachers
                                </h3>
                            </div>
                        </div>
                        <p className="text-white/95 text-[15px] font-medium leading-relaxed max-w-[280px] mt-4">
                            Trained and engaged through our Schools and Sustainability Programme across Abuja, Aba, and Uyo.
                        </p>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-[#f4c015] rounded-[2rem] p-10 flex flex-col items-center text-center text-white min-h-[360px] justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col items-center">
                            <Icons.SwatchBook className="w-12 h-12 mb-6 text-white stroke-[1.5]" />
                            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                                500+ students,<br />women, and MSME
                            </h3>
                        </div>
                        <p className="text-white/95 text-[15px] font-medium leading-relaxed max-w-[260px] mt-4">
                            Trained to transition to and manage cleaner energy sources.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function CorePillarsSection() {
    return (
        <section className="bg-white pb-24">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="bg-[#092963] rounded-[2rem] p-8 md:p-14">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                        {/* Image Column */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: -30 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:col-span-6 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md"
                        >
                            <Image
                                src="/men-on-roof.jpeg"
                                alt="Solar installation"
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        {/* Content Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="lg:col-span-6 text-white pl-0 lg:pl-6"
                        >
                            <h2 className="text-[#f4c015] text-3xl md:text-4xl font-extrabold mb-8 tracking-tight">
                                Core Pillars
                            </h2>
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-white/20 pb-4">
                                    <h3 className="text-lg md:text-xl font-bold tracking-wide">Pioneering Innovation</h3>
                                </div>
                                <div className="border-b border-white/20 pb-4">
                                    <h3 className="text-lg md:text-xl font-bold tracking-wide">Evidence-based Integrity</h3>
                                </div>
                                <div className="border-b border-white/20 pb-4">
                                    <h3 className="text-lg md:text-xl font-bold tracking-wide">Ecosystem Collaboration</h3>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TextStreamSection() {
    const words = [
        { text: "Power.", color: "text-[#092963]" },
        { text: "Lead.", color: "text-[#2da5cf]" },
        { text: "Lead.", color: "text-[#092963]" },
        { text: "Innovate.", color: "text-[#2da5cf]" },
    ];

    // Duplicate list of words enough to fill screen and create loop
    const list = [...words, ...words, ...words, ...words];

    return (
        <section className="bg-white py-16 overflow-hidden relative w-full border-y border-gray-100/50">
            {/* Left and Right gradient overlays to fade text in and out */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

            <div className="w-full overflow-hidden flex">
                <div className="flex gap-16 animate-marquee-custom whitespace-nowrap">
                    {list.map((item, idx) => (
                        <span
                            key={idx}
                            className={`text-5xl md:text-7xl font-extrabold tracking-tight ${item.color}`}
                        >
                            {item.text}
                        </span>
                    ))}
                </div>
                <div className="flex gap-16 animate-marquee-custom whitespace-nowrap" aria-hidden="true">
                    {list.map((item, idx) => (
                        <span
                            key={`dup-${idx}`}
                            className={`text-5xl md:text-7xl font-extrabold tracking-tight ${item.color}`}
                        >
                            {item.text}
                        </span>
                    ))}
                </div>
            </div>

            {/* Injected style tag for the CSS animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marqueeCustom {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-100%, 0, 0); }
                }
                .animate-marquee-custom {
                    animation: marqueeCustom 35s linear infinite;
                }
            `}} />
        </section>
    );
}

function HeroSection({ heroData }: { heroData: HeroData | null }) {
    return (
        <section className="relative pt-36 bg-white">
            {/* Two Column Text Layout */}
            <div className="container mx-auto px-6 md:px-12 max-w-7xl mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Left Column - Heading */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-6"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#092963] leading-[1.1] tracking-tight">
                            Powering Africa's<br />Energy Transition
                        </h1>
                    </motion.div>
                    {/* Right Column - Description */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="lg:col-span-6"
                    >
                        <p className="text-base md:text-lg text-[#092963]/90 leading-relaxed font-medium lg:pt-2">
                            Clean Technology Hub creates pathways into clean energy innovation, expanding access to knowledge, networks, and resources needed to shape Nigeria's transition into sustainable energy, making it inclusive, equitable, and driven by local leadership.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Overlapping Hero Image with Split Background */}
            <div className="relative pb-16">
                {/* Background color block at the bottom */}
                <div className="absolute inset-0 top-[40%] bg-[#092963] z-0"></div>

                <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                        className="relative w-full aspect-[16/7] overflow-hidden rounded-[2rem] shadow-xl"
                    >
                        <Image
                            src="/hero.png"
                            alt="Powering Africa's Energy Transition"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
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
                            {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
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
                            {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
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
                            {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />)}
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
