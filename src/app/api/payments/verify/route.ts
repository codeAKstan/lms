import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { paymentVerifySchema } from '@/lib/validations'

export async function POST(request: Request) {
    try {
        // 1. Authenticate the caller
        const user = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = paymentVerifySchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const { reference } = parsed.data

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
        if (!PAYSTACK_SECRET_KEY) {
            return NextResponse.json({ error: 'Payment system unavailable' }, { status: 500 })
        }

        // 2. Verify with Paystack
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        })

        const verifyData = await verifyRes.json()

        if (!verifyData.status || verifyData.data.status !== 'success') {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
        }

        const { metadata, amount, currency } = verifyData.data
        const { userId, courseId } = metadata

        // 3. Verify the authenticated user matches the payment metadata
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 })
        }

        // 4. Check if payment already recorded (idempotency)
        const existingPayment = await prisma.payment.findUnique({
            where: { gatewayReference: reference }
        })

        if (!existingPayment) {
            // Record payment via Prisma (consistent with webhook)
            await prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    amount,
                    currency,
                    gateway: 'paystack',
                    gatewayReference: reference,
                    status: 'COMPLETED',
                    metadata: verifyData.data
                }
            })
        }

        // 5. Ensure enrollment (idempotent upsert)
        await prisma.enrollment.upsert({
            where: {
                userId_courseId: { userId, courseId }
            },
            update: {
                progressPercent: 0,
            },
            create: {
                userId,
                courseId,
                progressPercent: 0,
                enrolledAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error: unknown) {
        logger.error({ error }, '')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


