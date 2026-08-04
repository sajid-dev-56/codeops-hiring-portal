import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/learn/progress — mark a lesson as complete
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, completed = true } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    // Check lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You must be enrolled in this course" }, { status: 403 });
    }

    if (completed === false) {
      await prisma.lessonCompletion.deleteMany({
        where: {
          lessonId,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ success: true, status: "removed" });
    } else {
      // Upsert completion
      const completion = await prisma.lessonCompletion.upsert({
        where: {
          lessonId_userId: {
            lessonId,
            userId: session.user.id,
          },
        },
        update: {},
        create: {
          lessonId,
          userId: session.user.id,
        },
      });
      return NextResponse.json(completion);
    }
  } catch (error) {
    console.error("Failed to mark progress:", error);
    return NextResponse.json({ error: "Failed to mark progress" }, { status: 500 });
  }
}

// GET /api/learn/progress?courseId=xxx — get user's progress for a course
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    });

    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId: session.user.id,
        lesson: { courseId },
      },
    });

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      totalLessons,
      completedLessons,
      progress,
    });
  } catch (error) {
    console.error("Failed to get progress:", error);
    return NextResponse.json({ error: "Failed to get progress" }, { status: 500 });
  }
}
