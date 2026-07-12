import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    // Verify access
    if (session.user.role === "CANDIDATE") {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });
      if (!candidate || candidate.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const messages = await prisma.message.findMany({
      where: { candidateId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, content } = body;

    if (!candidateId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify access and get candidate details for email
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    if (session.user.role === "CANDIDATE" && candidate.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        candidateId,
        content,
        sender: session.user.role as "ADMIN" | "CANDIDATE",
      },
    });

    // Send Email Notification
    const senderRole = session.user.role;
    const recipientEmail = senderRole === "ADMIN" ? candidate.email : process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@example.com";
    const subject = senderRole === "ADMIN" 
      ? `New message regarding your application for ${candidate.job.title}`
      : `New message from candidate ${candidate.name} (${candidate.job.title})`;

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      transporter.sendMail({
        from: `Hiring Portal <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>You have a new message</h2>
            <p><strong>${senderRole === "ADMIN" ? "Admin" : candidate.name}</strong> says:</p>
            <blockquote style="background: #f4f4f5; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px;">
              ${content}
            </blockquote>
            <p>
              Log in to the <a href="${process.env.NEXTAUTH_URL || '${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://codeopspro.vercel.app"}'}/${senderRole === 'ADMIN' ? 'candidate' : 'admin'}">portal</a> to reply.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
