import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { certificateGenerateSchema } from '@/lib/validations'
import { Client } from "@upstash/qstash"

const qstashClient = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

export async function POST(request: Request) {
    try {
        // 1. Authenticate the caller
        const user = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = certificateGenerateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { courseId } = parsed.data

        // 2. Verify the user has completed the course (server-side validation)
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                }
            }
        })

        if (!enrollment) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
        }

        if (enrollment.progressPercent < 100) {
            return NextResponse.json({ error: 'Course not yet completed' }, { status: 403 })
        }

        // 3. Check if certificate already exists
        const existing = await prisma.certificate.findFirst({
            where: { userId: user.id, courseId },
        })

        if (existing) {
            return NextResponse.json({ certificateId: existing.id })
        }

        // 4. Fetch user and course details to pass to the queue
        const [dbUser, course] = await Promise.all([
            prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
            prisma.course.findUnique({ where: { id: courseId }, select: { title: true } }),
        ])

        // 5. Dispatch job to QStash
        if (qstashClient) {
            // Using the actual URL where this app is hosted + the webhook route we created
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app';
            
            await qstashClient.publishJSON({
                url: `${appUrl}/api/qstash`,
                body: {
                    eventType: "generate-certificate",
                    data: {
                        userId: user.id,
                        courseId,
                        courseName: course?.title || 'Course',
                        studentName: dbUser?.name || 'Student'
                    }
                },
                delay: 0 // Optional: can delay execution if desired
            });
            
            return NextResponse.json({ message: "Certificate generation queued" });
        } else {
             logger.error("QStash not configured. Missing QSTASH_TOKEN.");
             return NextResponse.json({ error: "Certificate queuing failed" }, { status: 500 });
        }

    } catch (error: unknown) {
        logger.error({ error }, '')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


