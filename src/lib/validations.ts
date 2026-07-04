import { z } from 'zod'

// ============================================
// STRIP HTML — basic XSS prevention for text fields
// ============================================
function stripHtml(val: string) {
    return val.replace(/<[^>]*>/g, '')
}

const safeString = (max = 5000) => z.string().min(1).max(max).transform(stripHtml)
const cuid = () => z.string().min(1).max(30)

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const paymentInitSchema = z.object({
    courseId: cuid(),
    callbackUrl: z.string().url(),
})

export const paymentVerifySchema = z.object({
    reference: z.string().min(1).max(200),
})

// ============================================
// COMMENT SCHEMAS
// ============================================

export const commentCreateSchema = z.object({
    lessonId: cuid(),
    content: safeString(5000),
    parentId: z.string().optional(),
})

// ============================================
// REVIEW SCHEMAS
// ============================================

export const reviewCreateSchema = z.object({
    courseId: cuid(),
    rating: z.number().int().min(1).max(5),
    comment: safeString(5000),
})

// ============================================
// ENROLLMENT SCHEMAS
// ============================================

export const enrollmentCreateSchema = z.object({
    courseId: cuid(),
})

// ============================================
// CERTIFICATE SCHEMAS
// ============================================

export const certificateGenerateSchema = z.object({
    courseId: cuid(),
})

// ============================================
// PROGRESS SCHEMAS
// ============================================

export const progressUpdateSchema = z.object({
    lessonId: cuid(),
    completed: z.boolean().optional().default(true),
})

// ============================================
// QUIZ ATTEMPT SCHEMAS
// ============================================

export const quizAttemptSchema = z.object({
    answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
})

// ============================================
// SUBMISSION SCHEMAS
// ============================================

export const submissionCreateSchema = z.object({
    assignmentId: cuid(),
    fileUrl: z.string().url(),
    studentNotes: z.string().max(5000).optional(),
})

export const submissionGradeSchema = z.object({
    grade: z.number().int().min(0).max(100),
    feedback: z.string().max(5000).optional(),
})

// ============================================
// PROFILE SCHEMAS
// ============================================

export const profileUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
})

// ============================================
// COURSE QUERY PARAMS (for GET /api/courses)
// ============================================

export const courseQuerySchema = z.object({
    category: z.array(z.string()).optional(),
    level: z.array(z.string()).optional(),
    search: z.string().max(200).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    minDuration: z.coerce.number().int().min(0).optional(),
    maxDuration: z.coerce.number().int().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(['newest', 'trending', 'featured', 'rating']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
})
