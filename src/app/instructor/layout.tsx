"use client";

import { X, Menu, Plus, FileText, BarChart2 } from "lucide-react";
import { Inter } from "next/font/google";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import InstructorSidebar from "@/components/instructor/InstructorSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Footer from "@/components/marketing/Footer";
import { getInstructorAnalytics } from "@/actions/instructor/analytics";
import { toast } from "sonner";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const PAGE_TITLES: Record<string, { title: string; subtitle: (name: string) => string }> = {
    "/instructor/dashboard": { title: "Overview", subtitle: (name) => `Welcome back, ${name}. Here's your impact data.` },
    "/instructor/courses": { title: "My Courses", subtitle: () => "Manage your published and draft courses." },
    "/instructor/students": { title: "Students", subtitle: () => "View and engage with your enrolled students." },
    "/instructor/analytics": { title: "Analytics", subtitle: () => "Deep dive into your course performance." },
    "/instructor/earnings": { title: "Earnings", subtitle: () => "Track your revenue and payouts." },
    "/instructor/resources": { title: "Resources", subtitle: () => "Helpful tools and guides for instructors." },
    "/instructor/settings": { title: "Settings", subtitle: () => "Manage your instructor profile and preferences." },
};

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();

    const pageInfo = Object.entries(PAGE_TITLES).find(([key]) =>
        pathname === key || pathname.startsWith(key + "/")
    )?.[1] ?? { title: "Instructor Portal", subtitle: () => "Manage your courses and students." };

    const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Instructor";

    return (
        <div className={`${inter.variable} flex h-screen bg-[#f5f7fa] font-sans`}>
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#1a2e44] text-white rounded shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 bg-[#f5f7fa] transform transition-transform duration-300 shadow-[2px_0_24px_rgba(0,0,0,0.04)] ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                <InstructorSidebar />
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-6 md:px-8 py-4 gap-4">
                        <div className="hidden md:block">
                            <h1 className="text-2xl font-bold text-[#00153e] leading-tight tracking-tight">{pageInfo.title}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{pageInfo.subtitle(firstName)}</p>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={async () => {
                                        if (!user) return;
                                        const toastId = toast.loading("Generating report...");
                                        try {
                                            const res = await getInstructorAnalytics(user.id);
                                            if (res.success && res.data) {
                                                const csvRows = [
                                                    ["Course Name", "Enrollments", "Rating", "Revenue (NGN)"],
                                                    ...res.data.coursePerformance.map(c => [
                                                        `"${c.name.replace(/"/g, '""')}"`,
                                                        c.sales,
                                                        c.rating,
                                                        c.revenue
                                                    ])
                                                ];
                                                const csvContent = csvRows.map(e => e.join(",")).join("\n");
                                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                const link = document.createElement("a");
                                                const url = URL.createObjectURL(blob);
                                                link.setAttribute("href", url);
                                                link.setAttribute("download", `instructor_report_${new Date().toISOString().split('T')[0]}.csv`);
                                                link.style.visibility = 'hidden';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                toast.success("Report downloaded successfully", { id: toastId });
                                            } else {
                                                toast.error("Failed to generate report", { id: toastId });
                                            }
                                        } catch {
                                            toast.error("An error occurred while exporting", { id: toastId });
                                        }
                                    }}
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export Report
                                </button>
                                <Link href="/instructor/analytics" className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 transition-colors">
                                    <BarChart2 className="w-4 h-4" />
                                    View Analytics
                                </Link>
                            </div>
                            <div className="relative">
                                <NotificationBell />
                            </div>
                            <Link 
                                href="/instructor/courses/new"
                                className="flex items-center gap-2 bg-[#f5d300] hover:bg-[#e6c400] text-[#00153e] text-sm font-bold px-4 py-2 rounded shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Create New Course</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
                    {children}
                </div>
                
                <div className="mt-auto">
                    <Footer />
                </div>
            </main>
        </div>
    );
}
