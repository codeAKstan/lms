"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Globe,
    HelpCircle,
    Home,
    Star,
    Mail,
    TrendingUp,
    Newspaper,
    Map as MapIcon,
    Search,
    FileBarChart2,
} from "lucide-react";
import { Inter } from "next/font/google";
import { useState } from "react";
import "../globals.css";
import { useAuth } from "@/components/providers/AuthProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Footer from "@/components/marketing/Footer";

import { UserAvatar } from "@/components/ui/UserAvatar";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

// Page title map for the header
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    "/admin/dashboard": { title: "Platform Overview", subtitle: "Real-time metrics and insights for CTH EdTech Platform" },
    "/admin/users": { title: "User Management", subtitle: "Manage learners, instructors and admins" },
    "/admin/courses": { title: "Course Management", subtitle: "Approve, feature, or remove courses" },
    "/admin/payments": { title: "Payments & Revenue", subtitle: "View transactions and financial reports" },
    "/admin/analytics": { title: "Analytics", subtitle: "Platform-wide insights and trends" },
    "/admin/settings": { title: "Settings", subtitle: "Configure platform preferences" },
    "/admin/learning-paths": { title: "Learning Paths", subtitle: "Manage structured pathways" },
    "/admin/homepage": { title: "Homepage Content", subtitle: "Edit the public landing page" },
    "/admin/faq": { title: "FAQs", subtitle: "Manage frequently asked questions" },
    "/admin/testimonials": { title: "Testimonials", subtitle: "Curate student success stories" },
    "/admin/about": { title: "Impact Metrics", subtitle: "Showcase platform SDG impact" },
    "/admin/contact": { title: "Contact Submissions", subtitle: "Review inbound messages" },
    "/admin/blog": { title: "Blog", subtitle: "Manage articles and publications" },
    "/admin/site": { title: "Site Settings", subtitle: "Global site configuration" },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { signOut, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`${pathname}?search=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push(pathname);
        }
    };

    const pageInfo = Object.entries(PAGE_TITLES).find(([key]) =>
        pathname === key || pathname.startsWith(key + "/")
    )?.[1] ?? { title: "Admin", subtitle: "Platform management" };

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
                className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#f5f7fa] border-r border-gray-200 flex flex-col transform transition-transform duration-300 shadow-[2px_0_24px_rgba(0,0,0,0.04)] ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Logo + Branding */}
                <div className="px-6 pt-8 pb-5 border-b border-gray-100">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                        <Image src="/Logo.webp" alt="CTH EdTech Logo" width={32} height={32} className="object-contain" />
                        <span className="font-extrabold text-lg text-[#00153e] tracking-tight uppercase">Administration</span>
                    </Link>
                </div>

                {/* Scrollable Area (Nav + Bottom Section) */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {/* Navigation */}
                    <nav className="px-4 py-5 space-y-0.5">
                    <NavItem href="/admin/dashboard" icon={<LayoutDashboard className="w-4.5 h-4.5" />} label="Dashboard" />
                    <NavItem href="/" icon={<Globe className="w-4.5 h-4.5" />} label="Main Site" />

                    <NavSection label="Management" />
                    <NavItem href="/admin/users" icon={<Users className="w-4.5 h-4.5" />} label="Users" />
                    <NavItem href="/admin/courses" icon={<BookOpen className="w-4.5 h-4.5" />} label="Courses" />
                    <NavItem href="/admin/learning-paths" icon={<MapIcon className="w-4.5 h-4.5" />} label="Learning Paths" />
                    <NavItem href="/admin/payments" icon={<DollarSign className="w-4.5 h-4.5" />} label="Payments" />

                    <NavSection label="Content" />
                    <NavItem href="/admin/homepage" icon={<Home className="w-4.5 h-4.5" />} label="Homepage" />
                    <NavItem href="/admin/faq" icon={<HelpCircle className="w-4.5 h-4.5" />} label="FAQs" />
                    <NavItem href="/admin/testimonials" icon={<Star className="w-4.5 h-4.5" />} label="Testimonials" />
                    <NavItem href="/admin/about" icon={<TrendingUp className="w-4.5 h-4.5" />} label="Impact Metrics" />
                    <NavItem href="/admin/contact" icon={<Mail className="w-4.5 h-4.5" />} label="Contact Submissions" />
                    <NavItem href="/admin/blog" icon={<Newspaper className="w-4.5 h-4.5" />} label="Blog" />
                    <NavItem href="/admin/site" icon={<Globe className="w-4.5 h-4.5" />} label="Site Settings" />

                    <NavSection label="System" />
                    <NavItem href="/admin/analytics" icon={<BarChart3 className="w-4.5 h-4.5" />} label="Analytics" />

                    <div className="pt-3 mt-3 border-t border-gray-100">
                        <NavItem href="/admin/settings" icon={<Settings className="w-4.5 h-4.5" />} label="Settings" />
                    </div>
                </nav>

                {/* Bottom: System Admin Access + User */}
                <div className="p-4 border-t border-gray-100 space-y-3 mt-auto">
                    {/* System Admin Access Card */}
                    <div className="bg-[#1a2e44] rounded-xl p-4">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">
                            System Admin Access
                        </p>
                        <button className="w-full bg-[#f5c518] hover:bg-[#e6b800] text-[#1a2e44] text-xs font-bold py-2 rounded transition-colors">
                            Upgrade Plan
                        </button>
                    </div>

                    {/* User */}
                    <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all cursor-pointer group">
                        <UserAvatar 
                            user={user} 
                            className="w-9 h-9 border-2 border-white shadow-sm"
                            fallbackClassName="bg-[#1a2e44] text-white"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                                {user?.user_metadata?.full_name || "Admin User"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user?.email || "admin@cth.africa"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500 bg-white shadow-sm border border-gray-100 hover:border-red-100 hover:text-red-500 py-2 transition-all rounded-xl"
                    >
                        <LogOut className="w-3.5 h-3.5" />
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
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-6 md:px-8 py-4 gap-4">
                        {/* Page Title */}
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{pageInfo.title}</h1>
                            <p className="text-xs text-gray-400 mt-0.5">{pageInfo.subtitle}</p>
                        </div>

                        {/* Right: Search + Bell + CTA */}
                        <div className="flex items-center gap-3 ml-auto">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search data..."
                                    className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006a6a]/30 focus:border-[#006a6a] w-52 transition-all"
                                />
                            </form>

                            {/* Notification Bell */}
                            <div className="relative">
                                <NotificationBell />
                            </div>

                            {/* Generate Report CTA */}
                            <button 
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-[#006a6a] hover:bg-[#005555] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-[#006a6a]/20"
                            >
                                <FileBarChart2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Generate Report</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>

                {/* Footer */}
                <Footer />
            </main>
        </div>
    );
}

function NavSection({ label }: { label: string }) {
    return (
        <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{label}</p>
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
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group text-sm ${
                isActive
                    ? "bg-[#006a6a] text-white font-semibold shadow-md shadow-[#006a6a]/25"
                    : "bg-white text-gray-500 shadow-sm border border-gray-100 hover:border-gray-200 hover:text-[#006a6a]"
            }`}
        >
            <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#006a6a]"}`}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
