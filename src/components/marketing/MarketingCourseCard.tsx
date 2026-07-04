"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

export interface ApiCourse {
    id: string;
    slug: string;
    title: string;
    description: string;
    subtitle: string | null;
    thumbnail: string | null;
    price: number;
    originalPrice: number | null;
    currency: string;
    rating: number;
    studentCount: number;
    totalHours: number;
    lectures: number;
    level: string;
    difficulty: string | null;
    category: string;
    featured: boolean;
    bestseller: boolean;
    trending: boolean;
    learningOutcomes: string[];
    createdAt: string;
    instructor: { name: string; avatar: string | null } | null;
}

// Map categories to badge colors
const categoryColors: Record<string, string> = {
    "Engineering": "bg-[#e6f1fb] text-[#0c447c]",
    "Policy": "bg-[#eaf3de] text-[#1b5936]",
    "Strategy": "bg-[#ffdbcc] text-[#723615]",
    "Technology": "bg-[#e6f1fb] text-[#0c447c]",
    "Agriculture": "bg-[#eaf3de] text-[#1b5936]",
    "Science": "bg-[#90efef] text-[#006e6e]",
};

export default function MarketingCourseCard({ course }: { course: ApiCourse }) {
    const formatPrice = (amount: number) => {
        if (amount === 0) return "Free";
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
    };

    const badgeClass = categoryColors[course.category] || "bg-[#90efef] text-[#006e6e]";

    return (
        <Link href={`/courses/${course.slug}`} className="group block h-full">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full group-hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative h-[180px] w-full overflow-hidden shrink-0">
                    {course.thumbnail ? (
                        <Image 
                            src={course.thumbnail} 
                            alt={course.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full bg-[#eceef0] flex items-center justify-center">
                            <span className="text-4xl text-[#757781] font-bold">{course.category?.charAt(0) || "C"}</span>
                        </div>
                    )}
                    {/* Category badge overlay */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className={`${badgeClass} text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm`}>
                            {course.category || "General"}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-base font-bold text-[#191c1e] mb-2 leading-snug line-clamp-2 group-hover:text-[#006a6a] transition-colors">
                        {course.title}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {course.instructor?.avatar ? (
                                <Image src={course.instructor.avatar} alt={course.instructor?.name || "Instructor"} width={24} height={24} className="object-cover w-full h-full" />
                            ) : (
                                course.instructor?.name?.charAt(0) || "I"
                            )}
                        </div>
                        <span className="text-xs text-[#757781] truncate">
                            {course.instructor?.name || "Expert Instructor"} • Specialist
                        </span>
                    </div>

                    {/* Footer Row (Rating + Price) */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />
                            <span className="text-sm font-bold text-[#191c1e]">
                                {course.rating > 0 ? course.rating.toFixed(1) : "New"}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-[#191c1e]">
                            {formatPrice(course.price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
