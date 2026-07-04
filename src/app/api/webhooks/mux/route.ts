import { logger } from '@/lib/logger'
import { mux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

const qstashClient = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

export async function POST(req: Request) {
    try {
        // Read raw body ONCE (needed for signature verification)
        const rawBody = await req.text();
        const payload = JSON.parse(rawBody);
        const signature = req.headers.get("mux-signature");
        const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

        // 1. Verify signature mandatory
        if (!webhookSecret || !signature) {
            logger.error("MUX_WEBHOOK_SECRET is missing or request lacks signature");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        try {
                mux.webhooks.verifySignature(rawBody, req.headers, webhookSecret);
            } catch (err) {
                logger.error({ error: err }, "Invalid Mux Webhook Signature:");
                return new NextResponse("Invalid Signature", { status: 401 });
            }

        // 2. IDEMPOTENCY — Mux sends a unique `id` per event
        const eventId = payload.id as string | undefined;

        if (eventId) {
            const alreadyProcessed = await prisma.webhookLog.findFirst({
                where: { provider: "mux", event: eventId, processed: true }
            });
            if (alreadyProcessed) {
                logger.info(`[Mux Webhook] Duplicate event skipped: ${eventId}`);
                return new NextResponse(null, { status: 200 });
            }
        }

        // 3. Log the event (mark unprocessed until we finish)
        const logEntry = eventId
            ? await prisma.webhookLog.create({
                data: {
                    provider: "mux",
                    event: eventId,
                    payload: payload,
                    processed: false,
                }
            })
            : null;

        const type = payload.type;

        // 4. Dispatch to QStash instead of processing synchronously
        if (qstashClient && (type === "video.asset.ready" || type === "video.asset.deleted")) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app';
            
            await qstashClient.publishJSON({
                url: `${appUrl}/api/qstash`,
                body: {
                    eventType: "process-mux-webhook",
                    data: {
                        logEntryId: logEntry?.id,
                        type,
                        payloadData: payload.data
                    }
                }
            });
            logger.info(`[Mux Webhook] Queued event ${eventId} to QStash`);
        } else if (!qstashClient) {
             logger.error("[Mux Webhook] QStash not configured. Cannot process video asynchronously.");
             // Fallback to synchronous processing could go here, but for Enterprise Scale we fail-safe
        }

        return new NextResponse(null, { status: 200 });

    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Webhook Error", { status: 500 });
    }
}



