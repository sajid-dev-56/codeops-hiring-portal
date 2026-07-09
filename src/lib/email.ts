import nodemailer from "nodemailer";

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },
});

interface NewApplicationEmailParams {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDepartment: string;
}

export async function sendNewApplicationEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  jobDepartment,
}: NewApplicationEmailParams) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@hiringportal.com";

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `New Application: ${candidateName} for ${jobTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New Application Received</h1>
          </div>
          <div style="padding: 32px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px;">Candidate Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Name</td>
                  <td style="padding: 8px 0; color: #1e293b;">${candidateName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Email</td>
                  <td style="padding: 8px 0; color: #1e293b;">${candidateEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Position</td>
                  <td style="padding: 8px 0; color: #1e293b;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Department</td>
                  <td style="padding: 8px 0; color: #1e293b;">${jobDepartment}</td>
                </tr>
              </table>
            </div>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/candidates" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View in Admin Portal →
            </a>
          </div>
        </div>
      `,
    });
    console.log("✅ Application notification email sent to Admin");
  } catch (error) {
    console.error("Failed to send notification email to Admin:", error);
  }
}

export async function sendCandidateConfirmationEmail({
  candidateName,
  candidateEmail,
  jobTitle,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: candidateEmail,
      subject: `Application Received: ${jobTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Thank You for Applying!</h2>
          <p>Hi ${candidateName},</p>
          <p>We have successfully received your application for the <strong>${jobTitle}</strong> position.</p>
          <p>Our team will review your profile and get back to you soon. You can track your application status anytime by logging into the Candidate Portal.</p>
          <br/>
          <p>Best regards,</p>
          <p>The Hiring Team</p>
        </div>
      `,
    });
    console.log("✅ Confirmation email sent to Candidate");
  } catch (error) {
    console.error("Failed to send confirmation email to Candidate:", error);
  }
}

interface StageChangeEmailParams {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  newStage: string;
}

export async function sendStageChangeEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  newStage,
}: StageChangeEmailParams) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const getTemplate = () => {
    switch (newStage) {
      case "INTERVIEW_1":
      case "INTERVIEW_2":
      case "FINAL":
        return {
          subject: `Update on your application for ${jobTitle} - Interview Invitation`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Congratulations!</h2>
              <p>Hi ${candidateName},</p>
              <p>We'd love to invite you to an interview for the <strong>${jobTitle}</strong> position.</p>
              <p>Please log in to your <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/candidate">Candidate Portal</a> to view the schedule or messages from our team.</p>
            </div>
          `,
        };
      case "OFFER":
        return {
          subject: `Update on your application for ${jobTitle} - Offer!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Great News!</h2>
              <p>Hi ${candidateName},</p>
              <p>We are thrilled to extend an offer to you for the <strong>${jobTitle}</strong> position.</p>
              <p>Our team will be in touch shortly with the details. Check your <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/candidate">Candidate Portal</a> for updates.</p>
            </div>
          `,
        };
      case "REJECTED":
        return {
          subject: `Update on your application for ${jobTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Application Update</h2>
              <p>Hi ${candidateName},</p>
              <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position.</p>
              <p>While we were impressed with your background, we have decided to move forward with other candidates at this time.</p>
              <p>We wish you the best in your career search.</p>
            </div>
          `,
        };
      default:
        return null;
    }
  };

  const template = getTemplate();
  if (!template) return;

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: candidateEmail,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Failed to send stage change email:", error);
  }
}

