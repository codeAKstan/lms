import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/email";


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Save to database
        await prisma.contactSubmission.create({
            data: {
                name,
                email,
                subject,
                message,
                status: "unread",
            },
        });

        // 2. Send acknowledgment email using our EmailService
        // We'll create a basic HTML template for the email if renderContactAcknowledgementEmail doesn't exist,
        // but let's just use inline HTML for safety.
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0d9488;">Message Received</h2>
                <p>Hello ${name},</p>
                <p>Thank you for contacting CTH EdTech! This is an automated response to confirm that we have successfully received your message regarding "<strong>${subject}</strong>".</p>
                <p>Our support team will review your inquiry and get back to you as soon as possible.</p>
                <p>Best regards,<br/>The CTH EdTech Team</p>
            </div>
        `;

        await EmailService.send({
            to: email,
            subject: "We received your message - CTH EdTech",
            html: emailHtml,
        });

        return NextResponse.json({ success: true, message: "Contact message submitted successfully" });
    } catch (error) {
        console.error("[CONTACT_API_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
