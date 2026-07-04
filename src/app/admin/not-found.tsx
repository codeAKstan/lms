import Link from "next/link";

export default function AdminNotFound() {
    return (
        <div className="flex items-center justify-center p-6 min-h-[60vh]">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl font-black text-gray-300 mb-4">404</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Page Not Found</h1>
                <p className="text-gray-500 mb-6 text-sm">
                    This admin section doesn&apos;t exist or may have been removed.
                </p>
                <Link
                    href="/admin/dashboard"
                    className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded hover:bg-emerald-700 transition-colors inline-block"
                >
                    Back to Admin Dashboard
                </Link>
            </div>
        </div>
    );
}
