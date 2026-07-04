"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    BarChart3,
    DollarSign,
    Settings,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";

import { useState, useEffect } from "react";
import { getInstructorTrack } from "@/actions/instructor/profile";

export default function InstructorSidebar() {
    const { user, signOut } = useAuth();
    const [dbProfile, setDbProfile] = useState<{
        name: string | null;
        avatar: string | null;
        honorific: string | null;
        title: string | null;
        expertise: string | null;
    } | null>(null);

    useEffect(() => {
        if (user?.id) {
            getInstructorTrack(user.id).then(res => {
                if (res.profile) {
                    setDbProfile(res.profile);
                }
            });
        }
    }, [user?.id]);

    // Listen for profile updates dispatched by the settings page
    useEffect(() => {
        const handler = (e: Event) => {
            const { name, avatar, honorific, title, expertise } = (e as CustomEvent<{
                name: string; avatar: string; honorific: string; title: string; expertise: string;
            }>).detail;
            setDbProfile(prev => ({
                ...prev,
                name: name || null,
                avatar: avatar || null,
                honorific: honorific || null,
                title: title || null,
                expertise: expertise || null,
            }));
        };
        window.addEventListener("instructor-profile-updated", handler);
        return () => window.removeEventListener("instructor-profile-updated", handler);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#f5f7fa] border-r border-gray-200 w-64 shadow-[2px_0_24px_rgba(0,0,0,0.02)] z-10">
            {/* Logo */}
            <div className="px-6 py-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/Logo.webp"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-extrabold text-xl text-[#00153e] tracking-tight">
                        INSTRUCTOR
                    </span>
                </Link>
                
                {/* User Profile Block */}
                <Link href="/instructor/settings" className="flex items-center gap-3 mt-8 hover:bg-gray-100 p-2 -mx-2 rounded-xl cursor-pointer transition-colors group/profile">
                    <UserAvatar 
                        user={user} 
                        avatarUrl={dbProfile?.avatar}
                        nameOverride={dbProfile?.name}
                        className="w-10 h-10 shadow-sm"
                        fallbackClassName="bg-[#1a2e44] text-white"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#00153e] truncate">
                            {dbProfile?.honorific ? `${dbProfile.honorific} ` : ''}
                            {dbProfile?.name || user?.user_metadata?.full_name || "Instructor Hub"}
                        </p>
                        <p className="text-[11px] font-medium text-gray-500 leading-snug line-clamp-2 mt-0.5">
                            {dbProfile?.title || dbProfile?.expertise || "Instructor"}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Quick Action Removed (Moved to header in mockup) */}

            {/* Navigation and Bottom Section (Scrollable) */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                <nav className="flex-1 px-4 py-2 space-y-1">
                    <NavItem
                        href="/instructor/dashboard"
                        icon={<LayoutDashboard className="w-4.5 h-4.5" />}
                        label="Dashboard"
                    />
                    <NavItem
                        href="/instructor/courses"
                        icon={<BookOpen className="w-4.5 h-4.5" />}
                        label="My Courses"
                    />
                    <NavItem
                        href="/instructor/students"
                        icon={<Users className="w-4.5 h-4.5" />}
                        label="Students"
                    />
                    <NavItem
                        href="/instructor/analytics"
                        icon={<BarChart3 className="w-4.5 h-4.5" />}
                        label="Analytics"
                    />
                    <NavItem
                        href="/instructor/earnings"
                        icon={<DollarSign className="w-4.5 h-4.5" />}
                        label="Earnings"
                    />
                    <NavItem
                        href="/instructor/resources"
                        icon={<BookOpen className="w-4.5 h-4.5" />}
                        label="Resources"
                    />
                    <div className="pt-4 mt-4 border-t border-gray-200/50">
                        <NavItem
                            href="/instructor/settings"
                            icon={<Settings className="w-4.5 h-4.5" />}
                            label="Settings"
                        />
                    </div>
                </nav>

                {/* Upgrade & Sign Out Section */}
                <div className="p-4 mt-auto border-t border-gray-100">
                    <button className="w-full bg-[#006a6a] hover:bg-[#005555] text-white text-sm font-semibold py-3 rounded transition-colors shadow-sm mb-4">
                        Upgrade Plan
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 py-2 transition-colors rounded"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
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
    const isActive = pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 group text-sm font-semibold ${isActive
                ? "bg-white text-[#00153e] shadow-sm"
                : "text-gray-500 hover:text-[#00153e]"
                }`}
        >
            <span className={`transition-colors duration-200 ${isActive ? "text-[#00153e]" : "text-gray-400 group-hover:text-[#00153e]"}`}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
