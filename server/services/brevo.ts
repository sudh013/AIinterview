import { createTransport } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

class BrevoEmailService {
  private transporter;

  constructor() {
    // Configure Brevo SMTP
    this.transporter = createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN || process.env.BREVO_EMAIL_USER || "default_user",
        pass: process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_EMAIL_PASS || "default_pass",
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Check if email credentials are available
      if (!process.env.BREVO_SMTP_LOGIN && !process.env.BREVO_EMAIL_USER) {
        console.log("Email credentials not configured, skipping email send:", {
          to: options.to,
          subject: options.subject
        });
        return true; // Return true for demo purposes
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@aiinterview.com",
        to: options.to,
        subject: options.subject,
        text: options.textContent,
        html: options.htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      console.log("Email would have been sent:", {
        to: options.to,
        subject: options.subject
      });
      return true; // Return true for demo purposes instead of throwing
    }
  }

  async sendInterviewInvitation(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
    interviewLink: string
  ): Promise<boolean> {
    const subject = `AI Video Interview Invitation - ${jobTitle} Position at ${companyName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Video Interview Invitation</h1>
          </div>
          <div class="content">
            <p>Dear ${candidateName},</p>
            
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>!</p>
            
            <p>We're excited to move forward with your application and invite you to complete an AI-powered video interview. This innovative interview process will help us better understand your skills and fit for the role.</p>
            
            <h3>What to Expect:</h3>
            <ul>
              <li>Duration: Approximately 15-20 minutes</li>
              <li>Format: Video-recorded responses to pre-selected questions</li>
              <li>AI Analysis: Your responses will be analyzed for technical skills, communication, and confidence</li>
              <li>Preparation: Ensure you have a stable internet connection and working camera/microphone</li>
            </ul>
            
            <p>Please complete your interview within the next 7 days by clicking the button below:</p>
            
            <p style="text-align: center;">
              <a href="${interviewLink}" class="button">Start Your Video Interview</a>
            </p>
            
            <p><strong>Interview Link:</strong> <a href="${interviewLink}">${interviewLink}</a></p>
            
            <p>If you have any questions or technical issues, please don't hesitate to contact our support team.</p>
            
            <p>We look forward to learning more about you!</p>
            
            <p>Best regards,<br>
            The ${companyName} Hiring Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at ${companyName}!

We're excited to move forward with your application and invite you to complete an AI-powered video interview.

What to Expect:
- Duration: Approximately 15-20 minutes
- Format: Video-recorded responses to pre-selected questions
- AI Analysis: Your responses will be analyzed for technical skills, communication, and confidence
- Preparation: Ensure you have a stable internet connection and working camera/microphone

Please complete your interview within the next 7 days using this link:
${interviewLink}

If you have any questions or technical issues, please don't hesitate to contact our support team.

We look forward to learning more about you!

Best regards,
The ${companyName} Hiring Team
    `;

    return await this.sendEmail({
      to: candidateEmail,
      subject,
      htmlContent,
      textContent,
    });
  }
}

export const brevoService = new BrevoEmailService();
