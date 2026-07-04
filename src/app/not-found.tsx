import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-lg w-full text-center">
                <div className="text-8xl font-black text-emerald-600 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
                <p className="text-gray-500 mb-8 text-base">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/courses"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
