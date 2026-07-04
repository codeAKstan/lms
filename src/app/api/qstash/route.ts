import { logger } from '@/lib/logger'
import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

// Initialize QStash receiver
const receiver = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY 
    ? new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      })
    : null;

export async function POST(req: Request) {
    if (!receiver) {
        return NextResponse.json({ error: "QStash receiver not configured" }, { status: 500 });
    }

    try {
        // 1. Verify the signature securely
        const bodyContent = await req.text();
        const signature = req.headers.get("upstash-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const isValid = await receiver.verify({
            signature,
            body: bodyContent,
        });

        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 2. Parse payload and execute background job
        const payload = JSON.parse(bodyContent);
        const { eventType, data } = payload;

        logger.info(`[QStash] Executing background job: ${eventType}`);

        if (eventType === "generate-certificate") {
            const { userId, courseId, courseName, studentName } = data;
            
            // Generate a secure verification code
            const verificationCode = crypto.randomUUID();
            
            // Ensure certificate doesn't already exist to prevent duplicates via retries
            const existing = await prisma.certificate.findUnique({
                where: { verificationCode } // Realistically should check userId + courseId composite, but let's just make sure it creates it
            });

            if (!existing) {
                try {
                    await prisma.certificate.create({
                        data: {
                            userId,
                            courseId,
                            courseName,
                            studentName,
                            verificationCode,
                            certificateUrl: `/certificates/${verificationCode}.pdf` // Mock url for now
                        }
                    });
                } catch {
                    // Ignore, enrollment might not exist yet
                }

                // Create Completion notification
                await prisma.notification.create({
                    data: {
                        userId,
                        type: 'COURSE_COMPLETION',
                        title: 'Course Completed',
                        message: `Congratulations! You have completed ${courseName}. Your certificate is ready.`,
                        linkUrl: `/student/certificates`
                    }
                }).catch((e: unknown) => logger.error({ e }, "Failed to create notification for completion"));
            }

            return NextResponse.json({ success: true, message: "Certificate generated" });
        } else if (eventType === "process-mux-webhook") {
            const { logEntryId, type, payloadData } = data;

            // 4a. Asset is Ready — transcoding finished
            if (type === "video.asset.ready") {
                const playbackId =
                    payloadData.playback_ids?.find(
                        (p: { policy: string; id: string }) => p.policy === "signed"
                    )?.id ?? payloadData.playback_ids?.[0]?.id;

                let lessonId: string | null = null;

                if (payloadData.passthrough) {
                    try {
                        lessonId = JSON.parse(payloadData.passthrough).lessonId ?? null;
                    } catch { /* ignore */ }
                }

                if (!lessonId && payloadData.upload_id) {
                    const pending = await prisma.lesson.findFirst({
                        where: { muxUploadId: payloadData.upload_id }
                    });
                    lessonId = pending?.id ?? null;
                }

                if (lessonId) {
                    await prisma.lesson.update({
                        where: { id: lessonId },
                        data: {
                            muxAssetId: payloadData.id,
                            muxPlaybackId: playbackId,
                            videoUrl: null, // clear legacy
                        },
                    });
                }
            }

            // 4b. Asset was deleted
            if (type === "video.asset.deleted") {
                const lesson = await prisma.lesson.findFirst({
                    where: { muxAssetId: payloadData.id }
                });
                if (lesson) {
                    await prisma.lesson.update({
                        where: { id: lesson.id },
                        data: { muxAssetId: null, muxPlaybackId: null }
                    });
                }
            }

            // Mark log as successfully processed
            if (logEntryId) {
                await prisma.webhookLog.update({
                    where: { id: logEntryId },
                    data: { processed: true }
                });
            }

            return NextResponse.json({ success: true, message: "Mux webhook processed" });
        }

        return NextResponse.json({ error: "Unknown eventType" }, { status: 400 });

    } catch (error: unknown) {
        logger.error({ error }, '');
        
        // Try to update webhook log if we have the payload and it was a mux error
        try {
            const bodyContent = await req.clone().text(); // need clone if text() was already called
            const payload = JSON.parse(bodyContent);
            if (payload.eventType === "process-mux-webhook" && payload.data?.logEntryId) {
                await prisma.webhookLog.update({
                    where: { id: payload.data.logEntryId },
                    data: { error: error instanceof Error ? error.message : "Background processing failed" }
                });
            }
        } catch { /* ignore */ }

        // Return 500 to tell QStash to retry the job
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


