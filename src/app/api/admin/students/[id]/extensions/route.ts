import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTaskExtensionEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await params;
    const body = await req.json();

    const { taskId, dueDate } = body;

    if (!taskId || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { course: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const parsedDueDate = new Date(dueDate);

    const extension = await prisma.taskExtension.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: studentId,
        },
      },
      update: {
        dueDate: parsedDueDate,
      },
      create: {
        taskId,
        userId: studentId,
        dueDate: parsedDueDate,
      },
    });

    // Send email notification
    if (student.email && student.name) {
      await sendTaskExtensionEmail({
        studentName: student.name,
        studentEmail: student.email,
        taskTitle: task.title,
        courseTitle: task.course.title,
        newDueDate: parsedDueDate,
      });
    }

    return NextResponse.json(extension, { status: 201 });
  } catch (error) {
    console.error("Failed to grant task extension:", error);
    return NextResponse.json({ error: "Failed to grant task extension" }, { status: 500 });
  }
}
