import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function DashboardStats() {
  const [jobCount, candidateCount, interviewCount, stageData, recentCandidates] =
    await Promise.all([
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.candidate.count(),
      prisma.interview.count({
        where: {
          interviewDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(
              new Date().setDate(new Date().getDate() + 7)
            ),
          },
        },
      }),
      prisma.candidate.groupBy({
        by: ["stage"],
        _count: { stage: true },
      }),
      prisma.candidate.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { job: { select: { title: true } } },
      }),
    ]);

  const hiredCount =
    stageData.find((s) => s.stage === "HIRED")?._count.stage || 0;

  const stats = [
    {
      label: "Open Positions",
      value: jobCount,
      icon: "💼",
      color: "from-blue-500 to-blue-600",
      href: "/admin/jobs",
    },
    {
      label: "Total Candidates",
      value: candidateCount,
      icon: "👥",
      color: "from-purple-500 to-purple-600",
      href: "/admin/candidates",
    },
    {
      label: "Interviews This Week",
      value: interviewCount,
      icon: "📅",
      color: "from-orange-500 to-orange-600",
      href: "/admin/interviews",
    },
    {
      label: "Hired",
      value: hiredCount,
      icon: "🎉",
      color: "from-green-500 to-green-600",
      href: "/admin/candidates",
    },
  ];

  const stageLabels: Record<string, string> = {
    APPLIED: "Applied",
    SCREENING: "Screening",
    INTERVIEW_1: "Interview 1",
    INTERVIEW_2: "Interview 2",
    TEST: "Test",
    FINAL: "Final",
    OFFER: "Offer",
    HIRED: "Hired",
    REJECTED: "Rejected",
  };

  const stageColors: Record<string, string> = {
    APPLIED: "bg-blue-500",
    SCREENING: "bg-indigo-500",
    INTERVIEW_1: "bg-violet-500",
    INTERVIEW_2: "bg-purple-500",
    TEST: "bg-fuchsia-500",
    FINAL: "bg-pink-500",
    OFFER: "bg-amber-500",
    HIRED: "bg-green-500",
    REJECTED: "bg-red-500",
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="animate-fade-in card-hover bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
              >
                {stat.value}
              </span>
            </div>
            <p className="text-sm font-medium text-surface-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Overview */}
        <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Pipeline Overview
          </h2>
          <div className="space-y-3">
            {Object.keys(stageLabels).map((stage) => {
              const count =
                stageData.find((s) => s.stage === stage)?._count.stage || 0;
              const maxCount = Math.max(
                ...stageData.map((s) => s._count.stage),
                1
              );
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-surface-600 shrink-0">
                    {stageLabels[stage]}
                  </span>
                  <div className="flex-1 h-7 bg-surface-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${stageColors[stage]} rounded-lg transition-all duration-700 flex items-center px-2`}
                      style={{
                        width: `${Math.max((count / maxCount) * 100, count > 0 ? 15 : 0)}%`,
                      }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Recent Applications
            </h2>
            <Link
              href="/admin/candidates"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCandidates.length === 0 && (
              <p className="text-sm text-surface-400 py-4 text-center">
                No applications yet
              </p>
            )}
            {recentCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/admin/candidates/${candidate.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
                    {candidate.job.title}
                  </p>
                </div>
                <span className="text-xs text-surface-400">
                  {new Date(candidate.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 mt-1">
          Overview of your hiring pipeline
        </p>
      </div>
      
      <Suspense fallback={
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-100 dark:bg-surface-800 rounded-xl"></div>)}
          </div>
        </div>
      }>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
