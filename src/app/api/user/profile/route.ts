import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { profileUpdateSchema } from '@/lib/validations'

export async function GET(request: Request) {
    const user = await getAuthenticatedUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, name: true, email: true, role: true, avatar: true, bio: true, createdAt: true }
        });

        if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(profile)
    } catch (error) {
        logger.error({ error }, '')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const user = await getAuthenticatedUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    try {
        const data = await prisma.user.update({
            where: { id: user.id },
            data: parsed.data,
            select: { id: true, name: true, email: true, role: true, avatar: true, bio: true, createdAt: true }
        })

        return NextResponse.json(data)
    } catch (error) {
        logger.error({ error }, '')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


