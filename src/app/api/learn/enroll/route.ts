import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { enrollCourseSchema } from "@/lib/validations";

// POST /api/learn/enroll — enroll a student in a course
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only STUDENT, ADMIN, and INSTRUCTOR can enroll
    if (!["STUDENT", "ADMIN", "INSTRUCTOR"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Only students can enroll in courses" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = enrollCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.isPublished) {
      return NextResponse.json({ error: "This course is not available for enrollment" }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: parsed.data.courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: parsed.data.courseId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Failed to enroll:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
