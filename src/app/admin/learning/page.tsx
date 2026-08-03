import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Users, ClipboardCheck, Clock, ArrowRight } from "lucide-react";

export default async function AdminLearningDashboard() {
  const [courseCount, studentCount, pendingSubmissions, totalEnrollments] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.taskSubmission.count({ where: { status: { in: ["PENDING", "AI_GRADED"] } } }),
    prisma.enrollment.count(),
  ]);

  const recentSubmissions = await prisma.taskSubmission.findMany({
    where: { status: { in: ["PENDING", "AI_GRADED"] } },
    include: {
      user: { select: { name: true, email: true } },
      task: { select: { title: true, maxMarks: true, course: { select: { title: true } } } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Learning Portal</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Manage courses, tasks, and student progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
          <BookOpen className="w-8 h-8 text-primary-500 mb-3" />
          <div className="text-2xl font-bold text-surface-900 dark:text-white">{courseCount}</div>
          <div className="text-sm text-surface-500">Total Courses</div>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
          <Users className="w-8 h-8 text-accent-500 mb-3" />
          <div className="text-2xl font-bold text-surface-900 dark:text-white">{studentCount}</div>
          <div className="text-sm text-surface-500">Students</div>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
          <ClipboardCheck className="w-8 h-8 text-success-500 mb-3" />
          <div className="text-2xl font-bold text-surface-900 dark:text-white">{totalEnrollments}</div>
          <div className="text-sm text-surface-500">Enrollments</div>
        </div>
        <div className="bg-gradient-to-br from-warning-500 to-danger-500 rounded-2xl p-5 text-white">
          <Clock className="w-8 h-8 text-white/80 mb-3" />
          <div className="text-2xl font-bold">{pendingSubmissions}</div>
          <div className="text-sm text-white/80">Pending Reviews</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/learning/courses" className="bg-white dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 transition-colors group">
          <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">Manage Courses</h3>
          <p className="text-sm text-surface-500 mt-1">Create, edit, and publish courses</p>
          <ArrowRight className="w-4 h-4 text-surface-400 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/admin/learning/grades" className="bg-white dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 transition-colors group">
          <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">Grade Submissions</h3>
          <p className="text-sm text-surface-500 mt-1">Review and approve student work</p>
          <ArrowRight className="w-4 h-4 text-surface-400 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/admin/learning/announcements" className="bg-white dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 transition-colors group">
          <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">Announcements</h3>
          <p className="text-sm text-surface-500 mt-1">Post updates to your students</p>
          <ArrowRight className="w-4 h-4 text-surface-400 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent Pending Submissions */}
      {recentSubmissions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Pending Reviews</h2>
            <Link href="/admin/learning/grades" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500">
              View all →
            </Link>
          </div>
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 dark:text-white truncate">{sub.user.name}</p>
                    <p className="text-sm text-surface-500 truncate">
                      {sub.task.course.title} → {sub.task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {sub.status === "AI_GRADED" && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                        AI: {sub.aiMarks}/{sub.task.maxMarks}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      sub.status === "AI_GRADED"
                        ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                        : "bg-warning-100 dark:bg-warning-900/50 text-warning-600 dark:text-warning-400"
                    }`}>
                      {sub.status === "AI_GRADED" ? "Needs Approval" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
