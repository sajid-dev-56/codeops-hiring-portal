import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendQuizScheduledEmail } from "@/lib/email";

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
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
        order: body.order ?? (lastQuiz ? lastQuiz.order + 1 : 0),
      },
      include: {
        course: true
      }
    });

    if (quiz.startTime) {
      // Fetch enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: id },
        include: { user: true }
      });

      // Send email to all students
      for (const enrollment of enrollments) {
        await sendQuizScheduledEmail({
          studentName: enrollment.user.name || "Student",
          studentEmail: enrollment.user.email || "",
          courseTitle: quiz.course.title,
          quizTitle: quiz.title,
          startTime: quiz.startTime,
        });
      }
    }

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
