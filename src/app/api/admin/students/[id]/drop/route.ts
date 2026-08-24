import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dropStudentEnrollment } from "@/lib/activity";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await req.json().catch(() => ({}));
    const { courseId, enrollmentId, reason = "Dropped by Instructor/Admin" } = body;

    let targetEnrollments: { id: string }[] = [];

    if (enrollmentId) {
      targetEnrollments = [{ id: enrollmentId }];
    } else if (courseId) {
      const e = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true },
      });
      if (e) targetEnrollments = [e];
    } else {
      // Find all active enrollments for this user
      targetEnrollments = await prisma.enrollment.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true },
      });
    }

    if (targetEnrollments.length === 0) {
      return NextResponse.json(
        { error: "No active course enrollments found to drop" },
        { status: 400 }
      );
    }

    const results = [];
    for (const item of targetEnrollments) {
      const res = await dropStudentEnrollment({
        enrollmentId: item.id,
        reason,
        isAutomated: false,
        notifyStudent: true,
      });
      results.push(res);
    }

    return NextResponse.json({
      success: true,
      message: `Dropped student from ${results.length} course(s).`,
      results,
    });
  } catch (error: any) {
    console.error("Drop Student Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
