import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reactivateStudentEnrollment } from "@/lib/activity";

// GET /api/admin/reactivation-requests - List all reactivation requests
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, or undefined for all

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.reactivationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currentStreak: true,
            lastActivityDate: true,
          },
        },
        enrollment: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error("Admin Fetch Reactivation Requests Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/reactivation-requests - Process a reactivation request (Approve / Reject)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId, action, adminNote } = body;

    if (!requestId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Valid requestId and action (APPROVE or REJECT) are required." },
        { status: 400 }
      );
    }

    const request = await prisma.reactivationRequest.findUnique({
      where: { id: requestId },
      include: {
        enrollment: {
          include: {
            course: true,
            user: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await reactivateStudentEnrollment({
        enrollmentId: request.enrollmentId,
        adminNote: adminNote || "Approved by instructor/admin",
        notifyStudent: true,
      });

      return NextResponse.json({
        success: true,
        message: `Reactivation request approved. Student has been granted access to ${request.enrollment.course.title}.`,
      });
    } else {
      // REJECT
      const updatedRequest = await prisma.reactivationRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          resolvedAt: new Date(),
          adminNote: adminNote || "Reactivation request declined by instructor.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Reactivation request rejected.",
        request: updatedRequest,
      });
    }
  } catch (error: any) {
    console.error("Process Reactivation Request Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
