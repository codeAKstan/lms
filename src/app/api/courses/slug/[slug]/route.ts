import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Helper to normalize cache control
export const revalidate = 60 // revalidate every minute

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    try {
        const course = await prisma.course.findUnique({
            where: { slug },
            include: {
                instructor: {
                    select: { name: true, bio: true, avatar: true }
                },
                modules: {
                    orderBy: { position: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { position: 'asc' }
                        }
                    }
                },
                reviews: {
                    include: {
                        user: {
                            select: { name: true, avatar: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error) {
        logger.error({ error }, '[COURSE_SLUG_GET]')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
