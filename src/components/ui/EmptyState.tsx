import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-muted ${className}`}>
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6">
                {Icon && <Icon className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-xl font-bold text-accent mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
