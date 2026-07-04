import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { EmailService } from '@/lib/email'
import { enrollmentTemplate, paymentReceiptTemplate } from '@/lib/email-templates'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
    try {
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
        if (!PAYSTACK_SECRET_KEY) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

        // 1. Verify Signature
        const signature = request.headers.get('x-paystack-signature')
        if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

        const body = await request.text()
        const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex')

        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(body)

        // 2. Handle 'charge.success'
        if (event.event === 'charge.success') {
            const { metadata, reference, amount, currency, customer } = event.data
            const { userId, courseId } = metadata

            // Customer email might come from the event payload directly
            const customerEmail = customer?.email;

            if (userId && courseId) {
                // Check Idempotency: Has this payment already been processed?
                const existingPayment = await prisma.payment.findUnique({
                    where: { gatewayReference: reference }
                });

                if (existingPayment) {
                    // Webhook was already processed successfully, safely acknowledge
                    logger.info(`Payment webhook already processed for ref: ${reference}`);
                    return NextResponse.json({ received: true, status: 'already_processed' });
                }

                try {
                    // Run both operations in a Prisma Transaction to ensure data integrity
                    await prisma.$transaction(async (tx) => {
                        // 1. Record Payment
                        await tx.payment.create({
                            data: {
                                userId,
                                courseId,
                                amount: amount, // Kobo
                                currency,
                                gateway: 'paystack',
                                gatewayReference: reference,
                                status: 'COMPLETED',
                                metadata: event.data
                            }
                        });

                        // 2. Enroll User
                        await tx.enrollment.upsert({
                            where: {
                                userId_courseId: {
                                    userId,
                                    courseId
                                }
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
                        });
                    });

                    // 3. Send Enrollment Email Notification asynchronously
                    // We fetch User and Course outside the transaction to avoid blocking the DB locked state
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
                    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });

                    const recipientEmail = customerEmail || user?.email;

                    if (recipientEmail && user?.name && course?.title) {
                        const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount / 100);

                        // Don't await the email send so we can respond to Paystack quickly
                        EmailService.send({
                            to: recipientEmail,
                            subject: `Enrollment Confirmed: ${course.title}`,
                            html: enrollmentTemplate(user.name, course.title)
                        }).catch(err => logger.error({ err }, "Failed to send enrollment email"));

                        // Send Payment Receipt
                        EmailService.send({
                            to: recipientEmail,
                            subject: `Payment Receipt: ${course.title}`,
                            html: paymentReceiptTemplate(user.name, course.title, formattedAmount, reference)
                        }).catch(err => logger.error({ err }, "Failed to send payment receipt email"));

                        // In-app notifications
                        try {
                            await prisma.notification.createMany({
                                data: [
                                    {
                                        userId: String(userId),
                                        type: 'PAYMENT_SUCCESS',
                                        title: 'Payment Successful',
                                        message: `Your payment of ${formattedAmount} for ${course.title} was successful.`
                                    },
                                    {
                                        userId: String(userId),
                                        type: 'COURSE_ENROLLMENT',
                                        title: 'Enrollment Successful',
                                        message: `You are now enrolled in ${course.title}.`,
                                        linkUrl: `/student/courses/${courseId}`
                                    }
                                ]
                            });
                        } catch (e) {
                            logger.error({ e }, "Failed to create in-app notifications for payment");
                        }
                    }

                } catch (dbError) {
                    logger.error({ error: dbError }, 'Database transaction error');
                    // We don't want Paystack to keep retrying if it's a structural DB error, 
                    // but we might want them to retry if it's a timeout.
                    return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ received: true })

    } catch (error: unknown) {
        logger.error({ error }, 'Webhook error')
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
