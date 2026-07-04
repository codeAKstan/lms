import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            // Level 2 — white bg, navy-tinted shadow, 12px radius (per spec)
            default: 'bg-[var(--surface-container-lowest)] rounded-[var(--radius-md)] border border-[var(--outline-variant)] shadow-[var(--shadow-sm)]',
            // Elevated — hover lifts (course cards, widgets)
            elevated: 'bg-[var(--surface-container-lowest)] rounded-[var(--radius-md)] border border-[var(--outline-variant)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow',
            // Bordered — Level 1, inset only
            bordered: 'bg-[var(--surface-container-lowest)] rounded-[var(--radius-md)] border border-[var(--outline-variant)]',
        };

        return (
            <div
                ref={ref}
                className={clsx(variants[variant], className)}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('p-[var(--space-lg)] border-b border-[var(--outline-variant)]', className)}
            {...props}
        />
    )
);

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('p-[var(--space-lg)]', className)}
            {...props}
        />
    )
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('p-[var(--space-lg)] border-t border-[var(--outline-variant)]', className)}
            {...props}
        />
    )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
