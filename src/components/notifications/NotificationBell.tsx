"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    linkUrl: string | null;
    isRead: boolean;
    createdAt: string;
}

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications/unread");
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        void fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    // Close on navigation
    const prevPathname = useRef(pathname);
    useEffect(() => {
        if (prevPathname.current !== pathname) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- closing dropdown on navigation is intentional synchronization
            setIsOpen(false);
            prevPathname.current = pathname;
        }
    }, [pathname]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleMarkAsRead = async (id?: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            });
            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleClearRead = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "DELETE" });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => !n.isRead));
            }
        } catch (error) {
            console.error("Failed to clear read notifications:", error);
        }
    };

    // Format relative time (e.g. "2 hours ago")
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && notifications.length === 0) fetchNotifications();
                }}
                className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Mobile backdrop */}
                    <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
                    <div className={`absolute sm:w-96 w-[calc(100vw-32px)] max-w-sm z-50 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden transform transition-all ${align === "left" ? "-left-2 sm:-left-4 origin-top-left" : "right-0 sm:-right-2 origin-top-right"}`}>
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => handleMarkAsRead()}
                                    className="text-xs text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto bg-white">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-xs text-gray-400 mt-1">We&apos;ll let you know when something important happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 transition-colors hover:bg-gray-50 flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            {notification.linkUrl ? (
                                                <Link href={notification.linkUrl} onClick={() => handleMarkAsRead(notification.id)}>
                                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{notification.message}</p>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{notification.message}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notification.createdAt)}</p>
                                        </div>
                                        
                                        {!notification.isRead && (
                                            <button 
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="flex-shrink-0 text-primary hover:text-primary-dark p-1 rounded-full hover:bg-primary/10 self-start"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.some(n => n.isRead) && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleClearRead}
                                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-600 font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear read notifications
                            </button>
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
}
