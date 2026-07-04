export default function CoursePlayerLoading() {
    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Video player skeleton */}
            <div className="flex-1 flex flex-col">
                <div className="aspect-video bg-gray-800 animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-800 rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="w-80 bg-gray-850 border-l border-gray-700 p-4 space-y-3 hidden lg:block">
                <div className="h-6 bg-gray-800 rounded animate-pulse w-3/4 mb-4" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                        <div className="w-6 h-6 bg-gray-800 rounded animate-pulse flex-shrink-0" />
                        <div className="h-4 bg-gray-800 rounded animate-pulse flex-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}
