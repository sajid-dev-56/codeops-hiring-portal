import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await req.json();

    const lastQuestion = await prisma.question.findFirst({
      where: { quizId: quizId },
      orderBy: { order: "desc" },
    });

    const question = await prisma.question.create({
      data: {
        quizId: quizId,
        text: body.text,
        options: JSON.stringify(body.options), // stringified array
        correctOption: parseInt(body.correctOption),
        order: body.order ?? (lastQuestion ? lastQuestion.order + 1 : 0),
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Failed to add question:", error);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}
