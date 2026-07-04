export default function StudentCoursesLoading() {
    return (
        <div className="space-y-6 p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="h-40 bg-gray-200 animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                            <div className="h-2 bg-gray-200 rounded-full animate-pulse w-full mt-3" />
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
