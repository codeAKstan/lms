import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'cta';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

        const variants = {
            // Navy solid — primary actions
            primary: 'bg-[var(--cth-navy-container)] text-white hover:bg-[var(--cth-navy)] focus-visible:outline-[var(--cth-navy)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-[1px]',
            // Teal solid — secondary actions (Save Progress, Resources)
            secondary: 'bg-[var(--cth-teal)] text-white hover:bg-[#005757] focus-visible:outline-[var(--cth-teal)]',
            // Teal outline — tertiary
            outline: 'bg-transparent border border-[var(--outline-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-container)] focus-visible:outline-[var(--cth-teal)]',
            // Ghost — Cancel, Back, nav
            ghost: 'bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] focus-visible:outline-[var(--cth-teal)]',
            // Danger — destructive
            danger: 'bg-[var(--error)] text-white hover:bg-[#a01616] focus-visible:outline-[var(--error)]',
            // CTA — Bright Yellow, Navy text (Enroll, Start)
            cta: 'bg-[var(--cth-yellow)] text-[var(--cth-navy)] hover:bg-[#e6c400] focus-visible:outline-[var(--cth-yellow)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] font-bold',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-[var(--radius)]',
            md: 'px-5 py-2.5 text-sm rounded-[var(--radius)]',
            lg: 'px-6 py-3 text-base rounded-[var(--radius)]',
        };

        return (
            <button
                ref={ref}
                className={clsx(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
