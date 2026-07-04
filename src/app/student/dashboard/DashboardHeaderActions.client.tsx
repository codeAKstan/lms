"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import GlobalSearchModal from "@/components/shared/GlobalSearchModal.client";

export default function DashboardHeaderActions() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="flex items-center gap-3">
            {/* Search button */}
            <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-3 bg-white rounded-full border border-gray-100/80 shadow-md hover:bg-gray-50 transition-all text-[#00153e] cursor-pointer hover:scale-[1.03]"
            >
                <Search className="w-5 h-5" />
            </button>
            {/* Notification Bell */}
            <div className="relative p-1.5 bg-white rounded-full border border-gray-100/80 shadow-md hover:bg-gray-50 transition-all cursor-pointer hover:scale-[1.03] flex items-center justify-center">
                <NotificationBell />
            </div>

            <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}
