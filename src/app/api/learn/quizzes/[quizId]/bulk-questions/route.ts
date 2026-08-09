import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await req.json();
    const { questions } = body as {
      questions: { text: string; options: string[]; correctOption: number }[];
    };

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions payload" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Insert all questions
    const createdQuestions = await prisma.$transaction(
      questions.map((q) =>
        prisma.question.create({
          data: {
            quizId,
            text: q.text,
            options: JSON.stringify(q.options),
            correctOption: q.correctOption,
          },
        })
      )
    );

    return NextResponse.json({ message: "Questions created successfully", count: createdQuestions.length });
  } catch (error) {
    console.error("Bulk save error:", error);
    return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
  }
}
