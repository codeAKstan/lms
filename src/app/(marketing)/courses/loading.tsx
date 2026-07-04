export default function CoursesLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Search bar skeleton */}
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-8 max-w-xl" />

            {/* Course grid skeleton */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="h-48 bg-gray-200 animate-pulse" />
                        <div className="p-5 space-y-3">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                            <div className="flex justify-between pt-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
