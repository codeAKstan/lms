import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-api'
import { paymentInitSchema } from '@/lib/validations'

export async function POST(request: Request) {
    try {
        // 1. Auth Check
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const parsed = paymentInitSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
        }
        const { courseId, callbackUrl } = parsed.data

        // 2. Fetch Course Details (Price)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, price: true, currency: true }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // 3. Initialize Paystack Transaction
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

        if (!PAYSTACK_SECRET_KEY) {
            logger.error("PAYSTACK_SECRET_KEY is not configured")
            return NextResponse.json({ error: 'Payment system unavailable' }, { status: 500 })
        }

        // Amount is in kobo (if NGN) - Schema stores in cents/kobo
        const amountInKobo = course.price

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                amount: amountInKobo,
                currency: course.currency || 'NGN',
                callback_url: callbackUrl, // Localhost or prod URL
                metadata: {
                    courseId: course.id,
                    userId: user.id,
                    custom_fields: [
                        {
                            display_name: "Course",
                            variable_name: "course_title",
                            value: course.title
                        }
                    ]
                }
            })
        })

        const paystackData = await paystackResponse.json()

        if (!paystackResponse.ok) {
            return NextResponse.json({ error: paystackData.message || 'Payment initialization failed' }, { status: 400 })
        }

        // 4. Return Authorization URL
        return NextResponse.json({
            url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference: paystackData.data.reference
        })

    } catch (error: unknown) {
        logger.error({ error }, '')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


