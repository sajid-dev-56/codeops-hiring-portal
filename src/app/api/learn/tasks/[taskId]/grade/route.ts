import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { gradeSubmissionSchema } from "@/lib/validations";

// PUT /api/learn/tasks/[taskId]/grade — admin/instructor grades a submission
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = gradeSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get the submission and verify it belongs to this task
    const { taskId } = await params;
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: parsed.data.submissionId },
      include: { task: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.taskId !== taskId) {
      return NextResponse.json({ error: "Submission does not belong to this task" }, { status: 400 });
    }

    // Ensure marks don't exceed maxMarks
    if (parsed.data.marks > submission.task.maxMarks) {
      return NextResponse.json(
        { error: `Marks cannot exceed ${submission.task.maxMarks}` },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: parsed.data.submissionId },
      data: {
        marks: parsed.data.marks,
        feedback: parsed.data.feedback || null,
        status: parsed.data.status,
        gradedAt: parsed.data.status === "GRADED" ? new Date() : null,
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("Failed to grade submission:", error);
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
  }
}
