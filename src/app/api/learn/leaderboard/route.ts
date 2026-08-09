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

    // Get all graded quiz attempts grouped by user
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        status: "GRADED",
        score: { not: null },
      },
      select: {
        userId: true,
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

    for (const attempt of quizAttempts) {
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

    // Build leaderboard array and sort by totalMarks
    const leaderboard = Array.from(userMarksMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalMarks: data.totalMarks,
        tasksCompleted: data.tasksCompleted,
        coursesEnrolled: enrollmentMap.get(userId) || 0,
      }))
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
