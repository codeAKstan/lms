import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'navy';
    size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'md', ...props }, ref) => {
        const variants = {
            // Neutral — draft, default metadata
            default: 'bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]',
            // Navy — primary/institutional
            primary: 'bg-[var(--cth-navy-fixed)] text-[var(--cth-navy-container)]',
            // Green — success, case study chips
            success: 'bg-[var(--sdg-green-bg)] text-[var(--sdg-green)]',
            // Amber — warnings, attention
            warning: 'bg-[var(--sdg-amber-bg)] text-[var(--sdg-amber)]',
            // Red — errors, critical
            danger: 'bg-[var(--error-container)] text-[var(--on-error-container)]',
            // Blue — informational, PDF chips
            info: 'bg-[var(--sdg-blue-bg)] text-[var(--sdg-blue)]',
            // Teal — active, in-progress, live
            teal: 'bg-[var(--cth-teal-container)] text-[var(--cth-teal-on-container)]',
            // Navy dark — expert level
            navy: 'bg-[var(--cth-navy-container)] text-[var(--cth-navy-on-container)]',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-[10px]',
            md: 'px-2.5 py-0.5 text-[11px]',
            lg: 'px-3 py-1 text-xs',
        };

        return (
            <span
                ref={ref}
                className={clsx(
                    'inline-flex items-center rounded-[var(--radius-full)] font-bold uppercase tracking-[0.05em] leading-snug whitespace-nowrap',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
