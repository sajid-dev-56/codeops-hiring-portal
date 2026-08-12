import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, CheckCircle2 } from "lucide-react";
import { getGlobalLeaderboard } from "@/lib/leaderboard";

export default async function DashboardStats({ userId }: { userId: string }) {
  // Get enrolled courses count
  const enrollmentsCount = await prisma.enrollment.count({
    where: { userId },
  });

  const submissions = await prisma.taskSubmission.findMany({
    where: { userId, status: { in: ["PENDING", "AI_GRADED"] } },
  });
  const tasksPending = submissions.length;

  // Use the shared leaderboard logic so points and rank perfectly match the Leaderboard page
  const leaderboard = await getGlobalLeaderboard();
  const userStats = leaderboard.find((l) => l.userId === userId);
  
  const totalMarks = userStats?.absoluteMarks || 0;
  const percentage = userStats?.totalMarks || 0;
  const tasksCompleted = userStats?.tasksCompleted || 0;
  const rank = userStats?.rank || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
        <BookOpen className="w-8 h-8 text-primary-500 mb-3" />
        <div className="text-2xl font-bold text-surface-900 dark:text-white">{enrollmentsCount}</div>
        <div className="text-sm text-surface-500">Enrolled Courses</div>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
        <CheckCircle2 className="w-8 h-8 text-success-500 mb-3" />
        <div className="text-2xl font-bold text-surface-900 dark:text-white">{tasksCompleted}</div>
        <div className="text-sm text-surface-500">Tasks Completed</div>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
        <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
        <div className="text-2xl font-bold text-surface-900 dark:text-white">{totalMarks}</div>
        <div className="text-sm text-surface-500">Total Points</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl p-5 text-white">
        <div className="text-sm font-medium text-primary-200 mb-1">Your Rank</div>
        <div className="text-4xl font-bold">
          {rank > 0 ? `#${rank}` : "—"}
        </div>
        <div className="text-sm text-primary-200 mt-1">
          {tasksPending > 0 ? `${tasksPending} pending` : "All up to date"}
        </div>
      </div>
    </div>
  );
}
