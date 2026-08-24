import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/learn/reactivation-request - Check dropped status & pending appeals for current student
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all enrollments with dropped status
    const droppedEnrollments = await prisma.enrollment.findMany({
      where: { userId, status: "DROPPED" },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnail: true },
        },
        reactivationRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const isDropped = droppedEnrollments.length > 0;
    const pendingRequest = droppedEnrollments.find(
      (e) => e.reactivationRequests[0]?.status === "PENDING"
    )?.reactivationRequests[0] || null;

    return NextResponse.json({
      isDropped,
      droppedEnrollments,
      pendingRequest,
    });
  } catch (error: any) {
    console.error("Fetch Reactivation Status Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/learn/reactivation-request - Submit appeal/reason for course reactivation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const { enrollmentId, reason } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a valid explanation of why you were inactive." },
        { status: 400 }
      );
    }

    // Find dropped enrollment
    let targetEnrollmentId = enrollmentId;
    if (!targetEnrollmentId) {
      const firstDropped = await prisma.enrollment.findFirst({
        where: { userId, status: "DROPPED" },
        select: { id: true },
      });
      if (firstDropped) targetEnrollmentId = firstDropped.id;
    }

    if (!targetEnrollmentId) {
      return NextResponse.json(
        { error: "No dropped enrollment found for your account." },
        { status: 404 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: targetEnrollmentId },
    });

    if (!enrollment || enrollment.userId !== userId) {
      return NextResponse.json(
        { error: "Enrollment not found or unauthorized" },
        { status: 403 }
      );
    }

    // Check if there is already a PENDING request
    const existingPending = await prisma.reactivationRequest.findFirst({
      where: {
        enrollmentId: targetEnrollmentId,
        userId,
        status: "PENDING",
      },
    });

    let request;
    if (existingPending) {
      request = await prisma.reactivationRequest.update({
        where: { id: existingPending.id },
        data: { reason: reason.trim(), createdAt: new Date() },
      });
    } else {
      request = await prisma.reactivationRequest.create({
        data: {
          userId,
          enrollmentId: targetEnrollmentId,
          reason: reason.trim(),
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your reactivation request has been submitted to the instructor team.",
      request,
    });
  } catch (error: any) {
    console.error("Submit Reactivation Request Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
