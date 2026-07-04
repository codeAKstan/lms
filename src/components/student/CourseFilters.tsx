"use client";

import { useState } from "react";
import { SlidersHorizontal, Check, ChevronDown, ChevronUp } from "lucide-react";

export type FilterState = {
    categories: string[];
    levels: string[];
    price: "all" | "free" | "paid";
    duration: string[]; // "short", "medium", "long"
    minRating: number | null;
};

interface CourseFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export default function CourseFilters({ filters, setFilters }: CourseFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        category: true,
        level: true,
        price: true,
        duration: true,
        rating: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateCategories = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];
        setFilters({ ...filters, categories: newCategories });
    };

    const updateLevels = (level: string) => {
        const newLevels = filters.levels.includes(level)
            ? filters.levels.filter(l => l !== level)
            : [...filters.levels, level];
        setFilters({ ...filters, levels: newLevels });
    };

    const updateDuration = (duration: string) => {
        const newDurations = filters.duration.includes(duration)
            ? filters.duration.filter(d => d !== duration)
            : [...filters.duration, duration];
        setFilters({ ...filters, duration: newDurations });
    };

    const categories = ["Technology", "Sustainability", "Innovation", "Energy", "Business", "Design"];
    const levels = ["Beginner", "Intermediate", "Advanced"];
    const durations = [
        { label: "< 5 Hours", value: "short" },
        { label: "5 - 20 Hours", value: "medium" },
        { label: "20+ Hours", value: "long" }
    ];

    return (
        <div className="space-y-4">
            {/* Mobile Toggle */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2 text-gray-700">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters & Sort</span>
                </div>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Sidebar Content */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block space-y-6`}>

                {/* Categories */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('category')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <h3 className="font-bold text-gray-900">Categories</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.category && (
                        <div className="space-y-2.5">
                            {categories.map(category => (
                                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${filters.categories.includes(category)
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-300 bg-white group-hover:border-primary/50"
                                        }`}>
                                        {filters.categories.includes(category) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.categories.includes(category)}
                                        onChange={() => updateCategories(category)}
                                    />
                                    <span className={`text-sm ${filters.categories.includes(category) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {category}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Level */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('level')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <h3 className="font-bold text-gray-900">Difficulty Level</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.level ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.level && (
                        <div className="space-y-2.5">
                            {levels.map(level => (
                                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${filters.levels.includes(level)
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-300 bg-white group-hover:border-primary/50"
                                        }`}>
                                        {filters.levels.includes(level) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.levels.includes(level)}
                                        onChange={() => updateLevels(level)}
                                    />
                                    <span className={`text-sm ${filters.levels.includes(level) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {level}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <h3 className="font-bold text-gray-900">Price</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.price && (
                        <div className="space-y-2.5">
                            {(["all", "free", "paid"] as const).map(option => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${filters.price === option
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-300 bg-white group-hover:border-primary/50"
                                        }`}>
                                        {filters.price === option && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="price_filter"
                                        className="hidden"
                                        checked={filters.price === option}
                                        onChange={() => setFilters({ ...filters, price: option })}
                                    />
                                    <span className={`text-sm capitalize ${filters.price === option ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {option === "all" ? "Any Price" : option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Duration */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('duration')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <h3 className="font-bold text-gray-900">Duration</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.duration ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.duration && (
                        <div className="space-y-2.5">
                            {durations.map(item => (
                                <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${filters.duration.includes(item.value)
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-300 bg-white group-hover:border-primary/50"
                                        }`}>
                                        {filters.duration.includes(item.value) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.duration.includes(item.value)}
                                        onChange={() => updateDuration(item.value)}
                                    />
                                    <span className={`text-sm ${filters.duration.includes(item.value) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rating */}
                <div className="pb-6">
                    <button
                        onClick={() => toggleSection('rating')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <h3 className="font-bold text-gray-900">Rating</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.rating && (
                        <div className="space-y-2.5">
                            {[4.5, 4.0, 3.5, 3.0].map(rating => (
                                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${filters.minRating === rating
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-300 bg-white group-hover:border-primary/50"
                                        }`}>
                                        {filters.minRating === rating && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="rating_filter"
                                        className="hidden"
                                        checked={filters.minRating === rating}
                                        onChange={() => setFilters({ ...filters, minRating: rating })}
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm ${filters.minRating === rating ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {rating}+
                                        </span>
                                        <div className="flex text-amber-500 text-xs">
                                            {"★".repeat(5)}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
