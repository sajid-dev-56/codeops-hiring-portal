import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations";

// GET /api/learn/courses/[id]/tasks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const tasks = await prisma.task.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { submissions: true } },
        ...(session?.user?.id
          ? {
              submissions: {
                where: { userId: session.user.id },
                select: {
                  id: true,
                  status: true,
                  marks: true,
                  aiMarks: true,
                  submittedAt: true,
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/learn/courses/[id]/tasks
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = createTaskSchema.safeParse({ ...body, courseId: id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get next order value
    const lastTask = await prisma.task.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
    });

    const task = await prisma.task.create({
      data: {
        courseId: id,
        title: parsed.data.title,
        description: parsed.data.description,
        maxMarks: parsed.data.maxMarks,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        order: parsed.data.order ?? (lastTask ? lastTask.order + 1 : 0),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
