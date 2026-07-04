"use client";

import Image from "next/image";
import { useState } from "react";
import md5 from "md5";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    user: User | null;
    className?: string;
    fallbackClassName?: string;
    avatarUrl?: string | null;
    nameOverride?: string | null;
}

export function UserAvatar({ user, className, fallbackClassName, avatarUrl, nameOverride }: UserAvatarProps) {
    const [imgError, setImgError] = useState(false);

    // Resolve display name and email
    const name = nameOverride || user?.user_metadata?.full_name || user?.user_metadata?.name;
    const email = user?.email || "";

    // Resolve avatar src — DB avatar takes priority over OAuth/Gravatar
    let src = avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    if (!src && email) {
        const hash = md5(email.trim().toLowerCase());
        // d=404 tells Gravatar to return a 404 if no image is found, triggering our onError
        src = `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
    }

    const [prevSrc, setPrevSrc] = useState(src);
    if (src !== prevSrc) {
        setPrevSrc(src);
        setImgError(false);
    }

    // Derive initials for the fallback
    let initials = "U";
    if (name) {
        const parts = name.split(" ").filter(Boolean);
        if (parts.length >= 2) {
            initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else {
            initials = name.substring(0, 2).toUpperCase();
        }
    } else if (email) {
        initials = email.substring(0, 2).toUpperCase();
    }

    if (src && !imgError) {
        return (
            <div className={cn("relative overflow-hidden rounded-full flex-shrink-0 bg-gray-100", className)}>
                <Image
                    src={src}
                    alt={name || email || "User Avatar"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }

    // Fallback initials
    return (
        <div 
            className={cn(
                "rounded-full flex items-center justify-center font-bold flex-shrink-0 uppercase",
                fallbackClassName || "bg-[#1a2e44] text-white border-2 border-white",
                className
            )}
        >
            <span className="text-sm tracking-widest pl-0.5">{initials}</span>
        </div>
    );
}
