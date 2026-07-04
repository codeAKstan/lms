"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDashboardByRole } from "@/lib/role-redirect";

export default function AuthCallbackPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [showFallback, setShowFallback] = useState(false);

    // Redirect logic handles in AuthProvider mainly, but this page catches the callback
    // Supabase handles the session exchange automatically on the client side
    // We just need to redirect the user to their role-appropriate dashboard once ready

    useEffect(() => {
        if (user) {
            fetch("/api/auth/me")
                .then((res) => res.json())
                .then((data) => {
                    router.push(getDashboardByRole(data.user?.role));
                })
                .catch(() => {
                    router.push("/student/courses");
                });
        }
    }, [user, router]);

    // Safety timeout in case auth stalls
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user) {
                setShowFallback(true);
            }
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, [user]);

    return (
        <div className="flex h-screen items-center justify-center bg-surface">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-muted max-w-md w-full">
                {showFallback ? (
                    <>
                        <h2 className="text-xl font-bold mb-3 text-red-600">Authentication Timeout</h2>
                        <p className="text-muted-foreground mb-6">
                            We&apos;re having trouble verifying your login Session. Please try logging in again.
                        </p>
                        <Link href="/login">
                            <Button className="w-full">Return to Login</Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
                        <p className="text-muted-foreground">Please wait while we log you in securely.</p>
                    </>
                )}
            </div>
        </div>
    );
}
