// Enums (matching Prisma schema)
export enum Role {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
    MULTI_SELECT = 'MULTI_SELECT',
}

// Common Models (Frontend versions)
export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatar?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Course {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    thumbnail?: string;
    category: string;
    level: string;
    language: string;
    price: number;
    currency: string;
    published: boolean;
    featured: boolean;
    rating: number;
    studentCount: number;
    instructorId: string;
    instructor?: User;
    createdAt: Date;
    updatedAt: Date;

    // Phase 1 Enhanced Fields
    difficulty?: string;
    totalHours?: number;
    lectures?: number;
    originalPrice?: number;
    learningOutcomes?: string[];
    bestseller?: boolean;
    trending?: boolean;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    completedAt?: Date;
    progressPercent: number;
    lastAccessedAt: Date;
}

export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    courseName: string;
    studentName: string;
    certificateUrl?: string;
    verificationCode: string;
    issuedAt: Date;
}

// Curriculum types (used by student components)
export interface Lesson {
    id: string;
    title: string;
    duration: string;
    isFree: boolean;
    isCompleted?: boolean;
    videoUrl?: string | null;
    muxPlaybackId?: string | null;
    type?: string | null;
    content?: string | null;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

// Quiz types (used by quiz components)
export interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'multi-select';
    options: string[];
    correctAnswer: string | string[];
    explanation?: string;
}

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number; // in minutes
    passingScore: number;
    questions: QuizQuestion[];
}

// Course card view type (used by student course listing)
export interface CourseCardView {
    id: string;
    slug: string;
    title: string;
    description: string;
    instructor: {
        name: string;
        avatar: string;
    };
    thumbnail: string;
    price: number;
    currency: string;
    rating: number;
    studentCount: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    isFree: boolean;
    isPopular?: boolean;
}
