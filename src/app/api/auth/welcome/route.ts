import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { EmailService } from "@/lib/email";
import { welcomeTemplate } from "@/lib/email-templates";
import { logger } from "@/lib/logger";

/**
 * Supabase Auth Webhook — called when a new user signs up.
 * 
 * To configure this webhook in Supabase:
 * 1. Go to Authentication > Hooks in the Supabase dashboard
 * 2. Add a new HTTP hook for "After sign-up"
 * 3. Set the URL to: https://your-domain.com/api/auth/welcome
 * 4. Add a header: x-webhook-secret = your SUPABASE_WEBHOOK_SECRET env value
 */
export async function POST(request: Request) {
    try {
        // Verify webhook secret
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
        if (webhookSecret) {
            const incomingSecret = request.headers.get("x-webhook-secret");
            if (incomingSecret !== webhookSecret) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const body = await request.json();

        // Supabase sends user data under different shapes depending on hook type
        const user = body.record || body.user || body;
        const email = user.email;
        const name =
            user.raw_user_meta_data?.full_name ||
            user.user_metadata?.full_name ||
            email?.split("@")[0] ||
            "Student";

        if (!email) {
            logger.warn("[Welcome] No email found in webhook payload");
            return NextResponse.json({ received: true });
        }

        // Ensure user exists in our public users table
        const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!existingUser && user.id) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email,
                    name,
                    role: "STUDENT",
                },
            });
            logger.info({ userId: user.id }, "[Welcome] Created user record");
        }

        // Send welcome email (don't block response)
        EmailService.send({
            to: email,
            subject: "Welcome to Clean Tech Hub! 🌱",
            html: welcomeTemplate(name),
        }).catch((err) => logger.error({ err }, "[Welcome] Failed to send welcome email"));

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error({ error }, "[Welcome] Webhook processing failed");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
