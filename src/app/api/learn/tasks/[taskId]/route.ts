import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/learn/tasks/[taskId] — fetch task details with user's submission
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
        submissions: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify enrollment (unless admin/instructor)
    if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: task.courseId,
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "You must be enrolled in this course" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      maxMarks: task.maxMarks,
      dueDate: task.dueDate,
      order: task.order,
      createdAt: task.createdAt,
      course: task.course,
      submission: task.submissions[0] || null,
    });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}
