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
    
    // Check if attempt already exists
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_userId: {
          quizId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json(existingAttempt);
    }

    // Start new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Failed to start quiz attempt:", error);
    return NextResponse.json({ error: "Failed to start quiz attempt" }, { status: 500 });
  }
}
