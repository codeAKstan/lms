import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-6">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
                    <ShieldAlert className="w-10 h-10" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
                    <p className="text-muted-foreground text-lg">
                        You do not have permission to view this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact your administrator or try signing in with a different account.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Sign In Different Account
                    </Link>
                </div>

                <div className="pt-8 border-t border-gray-100 mt-8">
                    <p className="text-xs text-gray-400">Error Code: 403 Forbidden</p>
                </div>
            </div>
        </div>
    );
}
