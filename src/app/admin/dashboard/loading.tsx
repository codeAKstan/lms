export default function AdminDashboardLoading() {
    return (
        <div className="space-y-6 p-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded animate-pulse w-56" />

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                ))}
            </div>

            {/* Chart + Table skeleton */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-4" />
                    <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
