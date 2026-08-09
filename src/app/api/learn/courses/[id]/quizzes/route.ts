import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

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

    const lastQuiz = await prisma.quiz.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
    });

    const quiz = await prisma.quiz.create({
      data: {
        courseId: id,
        title: body.title,
        description: body.description || null,
        timeLimit: parseInt(body.timeLimit) || 20,
        order: body.order ?? (lastQuiz ? lastQuiz.order + 1 : 0),
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
