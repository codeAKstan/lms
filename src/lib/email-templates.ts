
/**
 * Basic Welcome Email Template
 */
export const welcomeTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Clean Tech Hub</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #059669;">Welcome to Clean Tech Hub!</h1>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Hi ${name},</p>
        <p>We are thrilled to have you on board. You've taken the first step towards mastering clean technology.</p>
        <p>You can now browse our catalog of courses and start learning immediately.</p>
        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app'}/student/courses" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Explore Courses
            </a>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The Clean Tech Hub Team</p>
    </div>
</body>
</html>
`;

/**
 * Course Enrollment Email Template
 */
export const enrollmentTemplate = (name: string, courseTitle: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Enrolled: ${courseTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #059669;">Enrollment Confirmed</h1>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Hi ${name},</p>
        <p>You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
        <p>We're excited to see what you'll achieve in this course.</p>
        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app'}/student/dashboard" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Go to Dashboard
            </a>
        </div>
        <p>Happy Learning!</p>
        <p>The Clean Tech Hub Team</p>
    </div>
</body>
</html>
`;

/**
 * Course Completion Email Template
 */
export const completionTemplate = (name: string, courseTitle: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Congratulations on completing ${courseTitle}!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #059669;">Congratulations, ${name}! 🎉</h1>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>You have successfully completed <strong>${courseTitle}</strong>!</p>
        <p>This is a massive achievement and a great step forward in your clean technology journey.</p>
        
        <p>You can now download your certificate of completion directly from your dashboard.</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app'}/student/dashboard" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               View Certificate
            </a>
        </div>
        <p>We can't wait to see what you learn next!</p>
        <p>Best regards,<br>The Clean Tech Hub Team</p>
    </div>
</body>
</html>
`;

/**
 * Payment Receipt Email Template
 */
export const paymentReceiptTemplate = (name: string, courseTitle: string, amount: string, reference: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt — ${courseTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #059669;">Payment Confirmed ✅</h1>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Hi ${name},</p>
        <p>Thank you for your purchase! Here is your payment receipt.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Course</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${courseTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Amount Paid</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${amount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280;">Reference</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 13px;">${reference}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; color: #6b7280;">Date</td>
                <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
        </table>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app'}/student/courses" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Start Learning
            </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af;">If you have any questions about this charge, please contact our support team.</p>
        <p>The Clean Tech Hub Team</p>
    </div>
</body>
</html>
`;

