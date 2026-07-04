export default function AdminCoursesLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-36" />
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse max-w-sm" />
                </div>
                <div className="divide-y divide-gray-50">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                            </div>
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
