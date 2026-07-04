"use client";

import { useMemo, useState } from "react";
import algoliasearch from "algoliasearch/lite";
import {
    InstantSearch,
    Hits,
    Pagination,
    Stats,
    useSearchBox,
    useClearRefinements,
    useRefinementList,
    UseSearchBoxProps,
    UseRefinementListProps,
    UseClearRefinementsProps
} from "react-instantsearch";
import * as Icons from "lucide-react";
import MarketingCourseCard from "./MarketingCourseCard";

interface AlgoliaHitRecord {
    objectID: string;
    title: string;
    description: string;
    subtitle: string;
    slug: string;
    price: number;
    category: string;
    level: string;
    language: string;
    rating: number;
    studentCount: number;
    thumbnail: string;
    instructorName: string;
}

interface ApiCourse {
    id: string;
    title: string;
    description: string;
    subtitle: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    currency: string;
    category: string;
    level: string;
    language: string;
    rating: number;
    studentCount: number;
    thumbnail: string;
    instructor: { name: string; avatar: string | null };
    totalHours: number;
    lectures: number;
    featured: boolean;
    bestseller: boolean;
    trending: boolean;
    learningOutcomes: string[];
    difficulty: string | null;
    createdAt: string;
}

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

// Custom Search Box matching the Hero UI
function CustomSearchBox(props: UseSearchBoxProps) {
    const { query, refine } = useSearchBox(props);
    const [inputValue, setInputValue] = useState(query);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        refine(inputValue);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
            <div className="relative flex-1 flex items-center">
                <Icons.Search className="absolute left-4 text-[#757781] w-5 h-5" />
                <input
                    type="search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.currentTarget.value)}
                    placeholder="What do you want to learn today? e.g. Solar Engineering, Carbon Markets"
                    className="w-full pl-12 pr-4 py-3 bg-[#f7f9fb] rounded-lg border-none focus:ring-2 focus:ring-[#006a6a] outline-none text-[#191c1e] placeholder-[#757781] text-sm"
                />
            </div>
            <button type="submit" className="bg-[#ffcc00] hover:bg-[#e6b800] text-[#00153e] font-bold px-8 py-3 rounded-lg transition-colors whitespace-nowrap text-sm">
                Search Courses
            </button>
        </form>
    );
}

// Custom Refinement List to ensure exact UI match and handle empty states
function CustomRefinementList(props: UseRefinementListProps & { title: string, isRadio?: boolean, staticItems?: string[] }) {
    const { items, refine } = useRefinementList(props);

    // If staticItems is provided, we map over them to ensure they always show.
    const displayItems = props.staticItems
        ? props.staticItems.map(label => {
            const found = items.find(i => i.label === label);
            return {
                label,
                value: label,
                isRefined: found ? found.isRefined : false,
                count: found ? found.count : 0
            };
        })
        : items;

    return (
        <div>
            <h3 className="text-sm font-bold text-[#191c1e] mb-4 capitalize">{props.title}</h3>
            {displayItems.length === 0 ? (
                <p className="text-sm text-[#757781] italic">No options available</p>
            ) : (
                <div className="space-y-3">
                    {displayItems.map(item => (
                        <label key={item.value} className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={item.isRefined}
                                onChange={() => refine(item.value)}
                                className={`mr-3 h-4 w-4 border-gray-300 text-[#006a6a] focus:ring-[#006a6a] transition-colors cursor-pointer ${props.isRadio ? 'rounded-full' : 'rounded'}`}
                            />
                            <span className="text-sm text-[#444650] group-hover:text-[#191c1e] transition-colors flex-1">
                                {item.label}
                                {item.count > 0 && <span className="ml-2 text-xs text-[#757781]">({item.count})</span>}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// Custom Clear Refinements matching the UI
function CustomClearRefinements(props: UseClearRefinementsProps) {
    const { canRefine, refine } = useClearRefinements(props);
    return (
        <button
            onClick={() => refine()}
            disabled={!canRefine}
            className={`w-full py-2.5 mt-8 border border-[#006a6a] text-[#006a6a] font-bold rounded-lg text-sm transition-colors ${canRefine ? 'hover:bg-[#90efef]' : 'opacity-50 cursor-not-allowed'}`}
        >
            Reset Filters
        </button>
    );
}

// Custom Hit Component using the MarketingCourseCard
function Hit({ hit }: { hit: AlgoliaHitRecord }) {
    const course = {
        id: hit.objectID,
        title: hit.title,
        description: hit.description,
        subtitle: hit.subtitle,
        slug: hit.slug,
        price: hit.price,
        originalPrice: null,
        currency: "NGN",
        category: hit.category,
        level: hit.level,
        language: hit.language,
        rating: hit.rating,
        studentCount: hit.studentCount,
        thumbnail: hit.thumbnail,
        instructor: { name: hit.instructorName || "Instructor", avatar: null },
        totalHours: 0, // Fallbacks
        lectures: 0,
        featured: false,
        bestseller: false,
        trending: false,
        learningOutcomes: [],
        difficulty: null,
        createdAt: new Date().toISOString()
    } as ApiCourse;

    return <MarketingCourseCard course={course} />;
}

export default function AlgoliaSearchPanel() {
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);

    const searchClient = useMemo(() => {
        if (!appId || !apiKey) return null;
        return algoliasearch(appId, apiKey);
    }, []);

    if (!searchClient) {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <div className="bg-white rounded-2xl border border-gray-200 p-12">
                    <p className="text-red-500 font-medium">Algolia Search is not configured.</p>
                    <p className="text-sm text-[#757781] mt-2">Please add NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY to your .env file.</p>
                </div>
            </div>
        );
    }

    return (
        <InstantSearch searchClient={searchClient} indexName="courses">
            {/* Hero Section */}
            <section className="bg-white pt-24 pb-16 border-b border-gray-100">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-4xl mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#00153e] mb-6 leading-tight">
                            Advance Your Climate Career
                        </h1>
                        <p className="text-lg md:text-xl text-[#444650] max-w-2xl leading-relaxed">
                            Specialized clean technology education designed for the African context. Academic rigor meets environmental innovation.
                        </p>
                    </div>

                    <CustomSearchBox />
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 md:px-12 py-12 max-w-[1440px]">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Icons.ListFilter className="w-5 h-5 text-[#191c1e]" />
                                    <h2 className="text-xl font-bold text-[#191c1e] m-0 p-0 leading-none"></h2>
                                </div>
                                <Icons.ChevronDown className={`w-5 h-5 text-[#757781] transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isFiltersOpen && (
                                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                                    <div className="space-y-8">
                                        <CustomRefinementList
                                            attribute="category"
                                            title="Category"
                                            staticItems={['Renewable Energy', 'Sustainability', 'Circular Economy', 'Climate Policy', 'Innovation', 'Green Business']}
                                        />

                                        <div className="pt-8 border-t border-gray-200">
                                            <CustomRefinementList
                                                attribute="level"
                                                title="Professional Level"
                                                isRadio
                                                staticItems={['Beginner', 'Intermediate', 'Expert']}
                                            />
                                        </div>

                                        <div className="pt-8 border-t border-gray-200">
                                            <CustomRefinementList
                                                attribute="duration"
                                                title="Duration"
                                                staticItems={['Under 4 weeks', '4-8 weeks', '8+ weeks']}
                                            />
                                        </div>
                                    </div>

                                    <CustomClearRefinements />
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                            <div className="text-sm text-[#444650] mb-4 sm:mb-0">
                                <Stats
                                    translations={{
                                        rootElementText({ nbHits }) {
                                            return `Showing ${nbHits} climate-focused courses`;
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[#757781]">Sort by:</span>
                                <select className="bg-transparent border-none font-semibold text-[#191c1e] focus:ring-0 cursor-pointer outline-none">
                                    <option>Most Relevant</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        <Hits
                            hitComponent={Hit}
                            classNames={{
                                list: "grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6",
                            }}
                        />

                        <Pagination
                            classNames={{
                                list: "flex justify-center items-center gap-2 mt-16",
                                item: "w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white text-[#444650] font-medium hover:bg-[#f7f9fb] transition-colors shadow-sm",
                                selectedItem: "!bg-[#006a6a] !text-white !border-[#006a6a] hover:!bg-[#005757]",
                                disabledItem: "opacity-50 cursor-not-allowed hover:bg-white"
                            }}
                        />
                    </div>
                </div>
            </div>
        </InstantSearch>
    );
}
