import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/learn/leaderboard — global student leaderboard
export async function GET() {
  try {
    // Get all graded task submissions grouped by user
    const submissions = await prisma.taskSubmission.findMany({
      where: {
        status: "GRADED",
        marks: { not: null },
      },
      select: {
        userId: true,
        marks: true,
        user: { select: { name: true } },
      },
    });

    // Get all graded quiz attempts grouped by user (order by most recent)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        status: "GRADED",
        score: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      select: {
        userId: true,
        quizId: true,
        score: true,
        user: { select: { name: true } },
      },
    });

    // Aggregate marks/scores per user
    const userMarksMap = new Map<
      string,
      { name: string; totalMarks: number; tasksCompleted: number }
    >();

    for (const sub of submissions) {
      const existing = userMarksMap.get(sub.userId);
      if (existing) {
        existing.totalMarks += sub.marks || 0;
        existing.tasksCompleted += 1;
      } else {
        userMarksMap.set(sub.userId, {
          name: sub.user.name || "Anonymous",
          totalMarks: sub.marks || 0,
          tasksCompleted: 1,
        });
      }
    }

    const processedUserQuizzes = new Set<string>();

    for (const attempt of quizAttempts) {
      const userQuizKey = `${attempt.userId}-${attempt.quizId}`;
      if (processedUserQuizzes.has(userQuizKey)) {
        continue; // Skip older attempts for the same quiz
      }
      processedUserQuizzes.add(userQuizKey);

      const existing = userMarksMap.get(attempt.userId);
      if (existing) {
        existing.totalMarks += attempt.score || 0;
        existing.tasksCompleted += 1; // Count quiz completion as a task
      } else {
        userMarksMap.set(attempt.userId, {
          name: attempt.user.name || "Anonymous",
          totalMarks: attempt.score || 0,
          tasksCompleted: 1,
        });
      }
    }

    // Get enrollment counts per user
    const enrollments = await prisma.enrollment.groupBy({
      by: ["userId"],
      _count: { courseId: true },
    });

    const enrollmentMap = new Map<string, number>();
    for (const e of enrollments) {
      enrollmentMap.set(e.userId, e._count.courseId);
    }

    // Calculate platform total possible marks
    const totalTaskMarksResult = await prisma.task.aggregate({ _sum: { maxMarks: true } });
    const totalQuizzesCount = await prisma.quiz.count();
    const totalPlatformMarks = (totalTaskMarksResult._sum.maxMarks || 0) + (totalQuizzesCount * 100);

    // Build leaderboard array and sort by percentage
    const leaderboard = Array.from(userMarksMap.entries())
      .map(([userId, data]) => {
        const percentage = totalPlatformMarks > 0 
          ? Math.round((data.totalMarks / totalPlatformMarks) * 100) 
          : 0;

        return {
          userId,
          name: data.name,
          totalMarks: percentage, // Reusing totalMarks field but it represents percentage now
          tasksCompleted: data.tasksCompleted,
          coursesEnrolled: enrollmentMap.get(userId) || 0,
        };
      })
      .sort((a, b) => b.totalMarks - a.totalMarks)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
