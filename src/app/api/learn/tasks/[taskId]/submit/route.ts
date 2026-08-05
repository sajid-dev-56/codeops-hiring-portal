import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { taskSubmissionSchema } from "@/lib/validations";
import { aiGradeSubmission } from "@/lib/ai-grading";

// POST /api/learn/tasks/[taskId]/submit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();
    const parsed = taskSubmissionSchema.safeParse({ ...body, taskId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { course: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check for task extension
    const extension = await prisma.taskExtension.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: session.user.id,
        },
      },
    });

    const effectiveDueDate = extension ? extension.dueDate : task.dueDate;

    // Check if task is overdue
    if (effectiveDueDate && new Date(effectiveDueDate).getTime() < new Date().getTime()) {
      return NextResponse.json({ error: "Submission closed. Task is overdue." }, { status: 403 });
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: task.courseId,
        },
      },
    });

    if (!enrollment && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You must be enrolled in this course to submit tasks" }, { status: 403 });
    }

    // Check for existing submission
    const existingSubmission = await prisma.taskSubmission.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: session.user.id,
        },
      },
    });

    let submission;

    if (existingSubmission) {
      // Allow resubmission if status is RESUBMIT or if the deadline hasn't passed yet
      const hasTimeLeft = !effectiveDueDate || new Date(effectiveDueDate).getTime() > new Date().getTime();

      if (existingSubmission.status !== "RESUBMIT" && !hasTimeLeft) {
        return NextResponse.json({ error: "You have already submitted this task" }, { status: 409 });
      }

      submission = await prisma.taskSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          content: parsed.data.content || null,
          linkUrl: parsed.data.linkUrl || null,
          status: "PENDING",
          marks: null,
          aiMarks: null,
          aiFeedback: null,
          feedback: null,
          submittedAt: new Date(),
          gradedAt: null,
        },
      });
    } else {
      submission = await prisma.taskSubmission.create({
        data: {
          taskId,
          userId: session.user.id,
          content: parsed.data.content || null,
          linkUrl: parsed.data.linkUrl || null,
          status: "PENDING",
        },
      });
    }

    // Trigger AI grading asynchronously (don't await to keep response fast)
    aiGradeSubmission(submission.id).catch((err) =>
      console.error("Background AI grading failed:", err)
    );

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Failed to submit task:", error);
    return NextResponse.json({ error: "Failed to submit task" }, { status: 500 });
  }
}
