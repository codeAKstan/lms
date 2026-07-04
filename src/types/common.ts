import { ReactNode } from 'react';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Common component prop types
export interface ChildrenProps {
    children: ReactNode;
}

export interface ClassNameProps {
    className?: string;
}

// Date utilities
export type DateString = string;
export type Timestamp = Date | DateString;

// Generic ID type
export type ID = string;

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
