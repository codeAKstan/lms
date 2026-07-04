"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Hits, useSearchBox, UseSearchBoxProps } from "react-instantsearch";
import * as Icons from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';

function CustomSearchBox(props: UseSearchBoxProps & { onClose: () => void }) {
    const { query, refine } = useSearchBox(props);
    const [inputValue, setInputValue] = useState(query);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        refine(e.target.value);
    };

    return (
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <Icons.Search className="w-5 h-5 text-gray-400" />
            <input
                ref={inputRef}
                type="search"
                value={inputValue}
                onChange={handleChange}
                placeholder="Search courses..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
            />
            <button onClick={props.onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <Icons.X className="w-5 h-5" />
            </button>
        </div>
    );
}

interface CourseHit {
    objectID: string;
    slug: string;
    title: string;
    thumbnail?: string;
    category?: string;
    level?: string;
}

function Hit({ hit }: { hit: CourseHit }) {
    return (
        <Link href={`/courses/${hit.slug}`} className="block">
            <div className="p-4 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                <div className="w-16 h-12 relative rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                    {hit.thumbnail && (
                        <Image src={hit.thumbnail} alt={hit.title} fill className="object-cover" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#00153e] truncate">{hit.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{hit.category} • {hit.level}</p>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </Link>
    );
}

export default function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const searchClient = useMemo(() => {
        if (!appId || !apiKey) return null;
        return algoliasearch(appId, apiKey);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    if (!searchClient) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 text-center">
                    <Icons.AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold">Search Unavailable</h3>
                    <p className="text-sm text-gray-500 mt-2">Algolia credentials are not configured.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-gray-900/40 backdrop-blur-sm pt-[10vh] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <InstantSearch searchClient={searchClient} indexName="courses">
                    <CustomSearchBox onClose={onClose} />
                    <div className="overflow-y-auto flex-1 p-2">
                        <Hits 
                            hitComponent={Hit}
                            classNames={{
                                list: "flex flex-col",
                                item: "border-b border-gray-50 last:border-0"
                            }}
                        />
                    </div>
                </InstantSearch>
            </div>
        </div>
    );
}
