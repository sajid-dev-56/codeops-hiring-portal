import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { answers, strikes } = body as { answers: Record<string, number>, strikes: number };

    // Fetch the quiz and its questions
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question: any) => {
      if (answers[question.id] === question.correctOption) {
        score += 1;
      }
    });

    const scorePercentage = Math.round((score / quiz.questions.length) * 100);

    // Update Attempt
    const attempt = await prisma.quizAttempt.update({
      where: {
        quizId_userId: {
          quizId: id,
          userId: session.user.id,
        },
      },
      data: {
        score: scorePercentage,
        strikes: strikes || 0,
        status: "GRADED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
