"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin page error:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center p-6 min-h-[60vh]">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Panel Error</h2>
                <p className="text-gray-500 mb-2 text-sm">
                    Something went wrong loading this section.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 mb-6 font-mono">Error ID: {error.digest}</p>
                )}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Retry
                    </button>
                    <Link
                        href="/admin/dashboard"
                        className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors inline-block"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
