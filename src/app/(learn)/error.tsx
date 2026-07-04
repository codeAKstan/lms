"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LearnError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Course player error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 text-center">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Playback Error</h2>
                <p className="text-gray-400 mb-6 text-sm">
                    We had trouble loading the course player. This might be a temporary issue.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Reload Player
                    </button>
                    <Link
                        href="/student/courses"
                        className="w-full px-5 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-xl hover:bg-gray-600 transition-colors inline-block"
                    >
                        Back to My Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
