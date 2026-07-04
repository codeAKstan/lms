"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getDashboardByRole } from "@/lib/role-redirect";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginPage() {
    const { signInWithEmail, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const redirectByRole = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                router.push(getDashboardByRole(data.user?.role));
            } else {
                router.push("/student/courses");
            }
        } catch {
            router.push("/student/courses");
        }
    }, [router]);

    useEffect(() => {
        if (user && !authLoading) {
            redirectByRole();
        }
    }, [user, authLoading, redirectByRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signInWithEmail(email, password);

        if (error) {
            toast.error(error.message || "Failed to sign in");
            setIsLoading(false);
        } else {
            toast.success("Welcome back!");
            await redirectByRole();
        }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Continue your journey toward climate mastery.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        aria-label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-surface border border-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs font-bold text-[#008A5E] hover:underline">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        type="password"
                        required
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-surface border border-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" id="remember" className="rounded border-muted text-[#008A5E] focus:ring-[#008A5E]/20 w-4 h-4" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me for 30 days
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="w-full flex items-center justify-center bg-[#FFC700] hover:bg-[#FFD12D] text-accent font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Sign in to Workspace"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="text-[#008A5E] font-bold hover:underline"
                >
                    Join the collective
                </Link>
            </div>
        </AuthLayout>
    );
}
