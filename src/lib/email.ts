import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },
});

const getAppUrl = () => process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://codeopspro.vercel.app";

const getHeader = (title?: string) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <div style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 24px; text-align: center;">
    <img src="${getAppUrl()}/logo.png" alt="CodeOps Pro" style="height: 48px;" />
  </div>
  ${title ? `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1></div>` : ""}
  <div style="padding: 32px; color: #334155; font-size: 16px; line-height: 1.6;">
`;

const getFooter = () => `
  </div>
</div>
`;

async function getTemplate(type: string, defaultSubject: string, defaultBody: string) {
  try {
    const template = await prisma.emailTemplate.findUnique({ where: { type } });
    if (template) return template;
  } catch (error) {
    console.error("DB error fetching template:", error);
  }
  return { subject: defaultSubject, body: defaultBody };
}

function interpolate(text: string, variables: Record<string, string>) {
  return text.replace(/{{(.*?)}}/g, (match, p1) => variables[p1] || match);
}

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

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@hiringportal.com";

  const defaultBody = `
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px;">Candidate Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Name</td><td style="padding: 8px 0; color: #1e293b;">{{candidateName}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Email</td><td style="padding: 8px 0; color: #1e293b;">{{candidateEmail}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Position</td><td style="padding: 8px 0; color: #1e293b;">{{jobTitle}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Department</td><td style="padding: 8px 0; color: #1e293b;">{{jobDepartment}}</td></tr>
      </table>
    </div>
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View in Admin Portal &rarr;</a>
  `;

  const template = await getTemplate("NEW_APPLICATION", `New Application: {{candidateName}} for {{jobTitle}}`, defaultBody);

  const variables = {
    candidateName,
    candidateEmail,
    jobTitle,
    jobDepartment,
    link: `${getAppUrl()}/admin/candidates`
  };

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: interpolate(template.subject, variables),
      html: getHeader("🎯 New Application Received") + interpolate(template.body, variables) + getFooter(),
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

  const defaultBody = `
    <h2>Thank You for Applying!</h2>
    <p>Hi {{candidateName}},</p>
    <p>We have successfully received your application for the <strong>{{jobTitle}}</strong> position.</p>
    <p>Our team will review your profile and get back to you soon. You can track your application status anytime by logging into the Candidate Portal.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Hiring Team</p>
  `;

  const template = await getTemplate("CONFIRMATION", `Application Received: {{jobTitle}}`, defaultBody);
  const variables = { candidateName, jobTitle };

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: candidateEmail,
      subject: interpolate(template.subject, variables),
      html: getHeader() + interpolate(template.body, variables) + getFooter(),
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

  const variables = {
    candidateName,
    jobTitle,
    link: `${getAppUrl()}/candidate`
  };

  let type = "";
  let defaultSubject = "";
  let defaultBody = "";
  let title = "";

  switch (newStage) {
    case "INTERVIEW_1":
    case "INTERVIEW_2":
    case "FINAL":
      type = "INTERVIEW";
      title = "Interview Invitation";
      defaultSubject = `Update on your application for {{jobTitle}} - Interview Invitation`;
      defaultBody = `
        <h2>Congratulations!</h2>
        <p>Hi {{candidateName}},</p>
        <p>We'd love to invite you to an interview for the <strong>{{jobTitle}}</strong> position.</p>
        <p>Please log in to your <a href="{{link}}">Candidate Portal</a> to view the schedule or messages from our team.</p>
      `;
      break;
    case "OFFER":
      type = "OFFER";
      title = "Job Offer";
      defaultSubject = `Update on your application for {{jobTitle}} - Offer!`;
      defaultBody = `
        <h2>Great News!</h2>
        <p>Hi {{candidateName}},</p>
        <p>We are thrilled to extend an offer to you for the <strong>{{jobTitle}}</strong> position.</p>
        <p>Our team will be in touch shortly with the details. Check your <a href="{{link}}">Candidate Portal</a> for updates.</p>
      `;
      break;
    case "REJECTED":
      type = "REJECTED";
      title = "Application Update";
      defaultSubject = `Update on your application for {{jobTitle}}`;
      defaultBody = `
        <h2>Application Update</h2>
        <p>Hi {{candidateName}},</p>
        <p>Thank you for taking the time to apply for the <strong>{{jobTitle}}</strong> position.</p>
        <p>While we were impressed with your background, we have decided to move forward with other candidates at this time.</p>
        <p>We wish you the best in your career search.</p>
      `;
      break;
    default:
      return;
  }

  const template = await getTemplate(type, defaultSubject, defaultBody);

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: candidateEmail,
      subject: interpolate(template.subject, variables),
      html: getHeader(title) + interpolate(template.body, variables) + getFooter(),
    });
  } catch (error) {
    console.error("Failed to send stage change email:", error);
  }
}

export async function sendTaskExtensionEmail({
  studentName,
  studentEmail,
  taskTitle,
  courseTitle,
  newDueDate,
}: {
  studentName: string;
  studentEmail: string;
  taskTitle: string;
  courseTitle: string;
  newDueDate: Date;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const variables = {
    studentName,
    taskTitle,
    courseTitle,
    dueDate: newDueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    link: `${getAppUrl()}/learn/dashboard`
  };

  const defaultSubject = `Deadline Extended: ${taskTitle}`;
  const defaultBody = `
    <h2>Deadline Extended</h2>
    <p>Hi {{studentName}},</p>
    <p>Good news! Your deadline for the task <strong>{{taskTitle}}</strong> in <strong>{{courseTitle}}</strong> has been extended.</p>
    <p>Your new deadline is: <strong>{{dueDate}}</strong>.</p>
    <br/>
    <a href="{{link}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard &rarr;</a>
  `;

  try {
    await transporter.sendMail({
      from: `Hiring Portal <${process.env.GMAIL_USER}>`,
      to: studentEmail,
      subject: defaultSubject,
      html: getHeader("🕒 Deadline Extended") + interpolate(defaultBody, variables) + getFooter(),
    });
  } catch (error) {
    console.error("Failed to send task extension email:", error);
  }
}
