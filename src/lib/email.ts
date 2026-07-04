import { Resend } from 'resend';
import { logger } from '@/lib/logger';

// Lazy-initialize Resend (avoid throwing at module scope during build)
let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string; // Optional custom sender
}

export class EmailService {
    private static defaultFrom = 'Clean Tech Hub <onboarding@resend.dev>'; // Default Resend testing domain

    /**
     * Send an email using Resend
     */
    static async send({ to, subject, html, from }: SendEmailParams) {
        // Validation for API Key
        if (!process.env.RESEND_API_KEY) {
            logger.warn({ to, subject }, '[EmailService] RESEND_API_KEY is missing. Email not sent.');
            return { success: false, error: 'Missing API Key' };
        }

        try {
            const data = await getResend().emails.send({
                from: from || this.defaultFrom,
                to,
                subject,
                html,
            });

            if (data.error) {
                console.error('[EmailService] Resend Error:', data.error);
                return { success: false, error: data.error };
            }

            logger.info({ to, emailId: data.data?.id }, '[EmailService] Email sent successfully');
            return { success: true, data: data.data };

        } catch (error) {
            console.error('[EmailService] Unexpected Error:', error);
            return { success: false, error };
        }
    }
}
