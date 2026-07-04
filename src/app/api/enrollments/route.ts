import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { enrollmentCreateSchema } from '@/lib/validations'
import { EmailService } from '@/lib/email'
import { enrollmentTemplate } from '@/lib/email-templates'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = enrollmentCreateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
        }
        const { courseId } = parsed.data

        // Lookup course and check if it is paid
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true, price: true }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        if (course.price && Number(course.price) > 0) {
            return NextResponse.json({ error: 'This is a paid course. You must purchase it first.' }, { status: 403 })
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ message: 'Already enrolled' }, { status: 200 })
        }

        // Verify user entry exists in public users table before enrolling
        let dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
                    role: 'STUDENT'
                }
            })
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: courseId,
                progressPercent: 0,
                enrolledAt: new Date()
            }
        })

        // Send enrollment confirmation email (non-blocking)
        if (dbUser.email && course?.title) {
            EmailService.send({
                to: dbUser.email,
                subject: `Enrollment Confirmed: ${course.title}`,
                html: enrollmentTemplate(dbUser.name, course.title),
            }).catch((err) => logger.error({ err }, "[Enrollment] Failed to send email"));
            
            // Create in-app notification
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'COURSE_ENROLLMENT',
                    title: 'Enrollment Successful',
                    message: `You have successfully enrolled in ${course.title}. Happy learning!`,
                    linkUrl: `/student/courses/${courseId}`
                }
            }).catch((e: unknown) => logger.error({ e }, "Failed to create notification"));
        }

        return NextResponse.json(enrollment)
    } catch (error) {
        logger.error({ error }, "Enrollment insert error");
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id },
            include: { course: true }
        })

        return NextResponse.json(enrollments)
    } catch (error) {
        logger.error({ error }, '');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


