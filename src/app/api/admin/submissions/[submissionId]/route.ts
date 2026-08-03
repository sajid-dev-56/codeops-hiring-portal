import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const body = await req.json();
    const { marks, status, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        marks: marks !== undefined ? parseInt(marks) : undefined,
        status: status || undefined,
        feedback: feedback !== undefined ? feedback : undefined,
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({ submission: updatedSubmission }, { status: 200 });
  } catch (error) {
    console.error("Update Submission Error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
