import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations";
import { sendNewApplicationEmail, sendCandidateConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeCandidateApplication } from "@/lib/ai";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(ip, 5, 60 * 60 * 1000); // 5 per hour

    if (!success) {
      return NextResponse.json(
        { error: "Too many applications. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = applicationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { website, ...data } = validated.data;

    // Honeypot check
    if (website && website.length > 0) {
      // Silently succeed to not tip off bots
      return NextResponse.json({ success: true });
    }

    // Verify job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job || job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This position is no longer accepting applications." },
        { status: 400 }
      );
    }

    // Find or Create Candidate User Account
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const hashedPassword = await hash(data.password, 12);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          hashedPassword,
          role: "CANDIDATE",
        },
      });
    } else {
      // Update password if user already exists
      user = await prisma.user.update({
        where: { email: data.email },
        data: { hashedPassword },
      });
    }

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        jobId: data.jobId,
        userId: user.id, // Link to User
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        portfolioUrl: data.portfolioUrl || null,
        expectedSalary: data.expectedSalary || null,
        noticePeriod: data.noticePeriod || null,
        coverLetter: data.coverLetter || null,
        cvFileKey: data.cvFileKey || null,
        cvFileUrl: data.cvFileUrl || null,
        stage: "APPLIED",
        source: "Website",
      },
    });

    // Send email notification to Admin (non-blocking)
    sendNewApplicationEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: job.title,
      jobDepartment: job.department,
    }).catch(console.error);

    // Send confirmation email to Candidate (non-blocking)
    sendCandidateConfirmationEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: job.title,
    }).catch(console.error);

    // (Manual) Admin will trigger AI Resume Screening from the dashboard.
    // analyzeCandidateApplication(candidate.id).catch(console.error);

    return NextResponse.json({ success: true, candidateId: candidate.id });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
