"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getDashboardByRole } from "@/lib/role-redirect";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
    const { signUpWithEmail, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState("");
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

        const { error } = await signUpWithEmail(email, password, fullName);

        if (error) {
            toast.error(error.message || "Failed to create account");
            setIsLoading(false);
        } else {
            toast.success("Account created! Please check your email to confirm.");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    };

    return (
        <AuthLayout title="Create an account" subtitle="Start your journey in clean technology.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        required
                        aria-label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-surface border border-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        placeholder="John Doe"
                    />
                </div>
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Password
                    </label>
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

                <button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="w-full flex items-center justify-center bg-[#FFC700] hover:bg-[#FFD12D] text-accent font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-[#008A5E] font-bold hover:underline"
                >
                    Sign in to Workspace
                </Link>
            </div>
        </AuthLayout>
    );
}
