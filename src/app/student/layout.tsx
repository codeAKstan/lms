"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    BookOpen,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Calendar,
    Award,
    Globe
} from "lucide-react";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import "../globals.css";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Image from "next/image";
import { getStudentProfileSidebar } from "@/actions/student/profile";
import Footer from "@/components/marketing/Footer";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, signOut } = useAuth();
    const [dbProfile, setDbProfile] = useState<{
        name: string | null;
        avatar: string | null;
        bio: string | null;
    } | null>(null);

    useEffect(() => {
        if (user?.id) {
            getStudentProfileSidebar(user.id).then(res => {
                if (res.success && res.profile) {
                    setDbProfile(res.profile);
                }
            });
        }
    }, [user?.id]);

    useEffect(() => {
        const handler = (e: Event) => {
            const { name, avatar, bio } = (e as CustomEvent<{
                name: string; avatar: string; bio: string;
            }>).detail;
            setDbProfile(prev => ({
                ...prev,
                name: name || null,
                avatar: avatar || null,
                bio: bio || null,
            }));
        };
        window.addEventListener("student-profile-updated", handler);
        return () => window.removeEventListener("student-profile-updated", handler);
    }, []);

    return (
        <div className={`${inter.variable} flex h-screen bg-[#F8F9FB]`}>
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#00153e] text-white rounded-lg shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#F8F9FB] border-r border-gray-100/80 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Header */}
                    <div className="px-6 pt-6 pb-2">
                        <Link href="/student/dashboard" className="flex items-center gap-2 group">
                            <Image
                                src="/Logo.webp"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-extrabold text-xl text-[#00153e] tracking-tight">
                                STUDENT
                            </span>
                        </Link>
                    </div>

                    {/* Profile Card Selector */}
                    <div className="px-4 py-3">
                        <Link href="/student/settings" className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(9,41,98,0.02)] hover:bg-gray-50/80 transition-colors cursor-pointer group/profile w-full block">
                            <div className="flex items-center gap-3">
                                <UserAvatar 
                                    user={user} 
                                    avatarUrl={dbProfile?.avatar}
                                    nameOverride={dbProfile?.name}
                                    className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0"
                                    fallbackClassName="bg-[#00153e] text-white font-bold"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#00153e] leading-snug truncate">
                                        {dbProfile?.name || user?.user_metadata?.full_name || "Learning Hub"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        <NavItem
                            href="/student/dashboard"
                            icon={<Home className="w-5 h-5" />}
                            label="Dashboard"
                        />
                        <NavItem
                            href="/student/courses"
                            icon={<BookOpen className="w-5 h-5" />}
                            label="My Learning"
                        />
                        <NavItem
                            href="/student/progress"
                            icon={<GraduationCap className="w-5 h-5" />}
                            label="Pathways"
                        />
                        <NavItem
                            href="/student/calendar"
                            icon={<Calendar className="w-5 h-5" />}
                            label="Calendar"
                        />
                        <NavItem
                            href="/student/certificates"
                            icon={<Award className="w-5 h-5" />}
                            label="Resources"
                        />
                        <div className="pt-2 mt-2 border-t border-gray-100/50">
                            <NavItem
                                href="/student/settings"
                                icon={<Settings className="w-5 h-5" />}
                                label="Settings"
                            />
                            <NavItem
                                href="/"
                                icon={<Globe className="w-5 h-5" />}
                                label="Main Site"
                            />
                        </div>
                    </nav>

                    {/* Pro Access Card */}
                    <div className="px-4 py-3 mt-auto">
                        <div className="bg-[#00153e] p-5 rounded-2xl border border-[#092962] relative overflow-hidden shadow-md">
                            {/* Decorative background shape */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#092962]/30 rounded-full blur-xl -mr-8 -mt-8"></div>
                            
                            <span className="text-[10px] font-bold text-[#90efef] tracking-widest block mb-2 font-sans uppercase">
                                Pro Access
                            </span>
                            <p className="text-sm font-bold text-white mb-4 leading-snug">
                                Master advanced carbon accounting.
                            </p>
                            <button
                                className="w-full bg-[#90efef] text-[#00153e] hover:bg-[#72e5e5] active:scale-[0.98] transition-all font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm cursor-pointer"
                                onClick={() => alert("Upgrade feature coming soon!")}
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    </div>

                    {/* Sign Out Section */}
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100/50">
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50/50"
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-white">
                <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
                <Footer />
            </main>
        </div>
    );
}

function NavItem({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/student/dashboard" && pathname.startsWith(href + "/"));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-white text-[#00153e] font-semibold shadow-[0_4px_12px_rgba(9,41,98,0.03)] border border-gray-100/50"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                }`}
        >
            <span className={`transition-colors duration-200 ${isActive ? "text-[#00153e]" : "text-gray-400 group-hover:text-gray-600"}`}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
