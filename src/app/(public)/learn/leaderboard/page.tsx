import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { Trophy } from "lucide-react";
import LeaderboardTable from "@/components/learn/LeaderboardTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function LeaderboardData() {
  const submissions = await prisma.taskSubmission.findMany({
    where: { status: "GRADED", marks: { not: null } },
    select: {
      userId: true,
      marks: true,
      user: { select: { name: true } },
    },
  });

  const userMarksMap = new Map<string, { name: string; totalMarks: number; tasksCompleted: number }>();
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

  const enrollments = await prisma.enrollment.groupBy({
    by: ["userId"],
    _count: { courseId: true },
  });
  const enrollmentMap = new Map<string, number>();
  for (const e of enrollments) {
    enrollmentMap.set(e.userId, e._count.courseId);
  }

  const leaderboard = Array.from(userMarksMap.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      totalMarks: data.totalMarks,
      tasksCompleted: data.tasksCompleted,
      coursesEnrolled: enrollmentMap.get(userId) || 0,
    }))
    .sort((a, b) => b.totalMarks - a.totalMarks)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return <LeaderboardTable entries={leaderboard} />;
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mb-8">
          <Link href="/learn" className="hover:text-primary-600 transition-colors">Learning Hub</Link>
          <span>/</span>
          <span className="text-surface-900 dark:text-white font-medium">Leaderboard</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Student Leaderboard
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
            Rankings based on total marks earned across all graded tasks and assignments.
          </p>
        </div>

        {/* Leaderboard */}
        <Suspense fallback={
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-100 dark:bg-surface-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        }>
          <LeaderboardData />
        </Suspense>
      </div>
    </div>
  );
}
