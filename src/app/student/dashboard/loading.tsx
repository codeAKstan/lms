export default function StudentDashboardLoading() {
    return (
        <div className="space-y-6 p-6">
            {/* Welcome header skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
                    </div>
                ))}
            </div>

            {/* Recent courses skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                            <div className="h-2 bg-gray-200 rounded-full animate-pulse w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
