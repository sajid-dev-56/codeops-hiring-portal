import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Trophy, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import CourseCard from "@/components/learn/CourseCard";
import ProgressBar from "@/components/learn/ProgressBar";
import DailyGoalsWidget from "@/components/learn/DailyGoalsWidget";
import UpcomingDeadlinesWidget from "@/components/learn/UpcomingDeadlinesWidget";
import RecentAnnouncementsWidget from "@/components/learn/RecentAnnouncementsWidget";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Get enrolled courses with progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true, enrollments: true, tasks: true } },
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // Get lesson completions
  const completedLessonIds = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedLessonIds.map((c) => c.lessonId));

  // Get submissions with marks
  const submissions = await prisma.taskSubmission.findMany({
    where: { userId },
    select: { marks: true, status: true },
  });

  const totalMarks = submissions
    .filter((s) => s.status === "GRADED" && s.marks !== null)
    .reduce((sum, s) => sum + (s.marks || 0), 0);

  const tasksCompleted = submissions.filter((s) => s.status === "GRADED").length;
  const tasksPending = submissions.filter((s) => s.status === "PENDING" || s.status === "AI_GRADED").length;

  // Get rank
  const allSubmissions = await prisma.taskSubmission.findMany({
    where: { status: "GRADED", marks: { not: null } },
    select: { userId: true, marks: true },
  });

  const userTotals = new Map<string, number>();
  for (const sub of allSubmissions) {
    userTotals.set(sub.userId, (userTotals.get(sub.userId) || 0) + (sub.marks || 0));
  }
  const sortedUsers = Array.from(userTotals.entries()).sort((a, b) => b[1] - a[1]);
  const rank = sortedUsers.findIndex(([id]) => id === userId) + 1;

  // Build course data with progress
  const coursesWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course._count.lessons;
    const completedLessons = enrollment.course.lessons.filter((l) => completedSet.has(l.id)).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { ...enrollment.course, progress };
  });

  // Fetch upcoming deadlines
  const upcomingTasks = await prisma.task.findMany({
    where: {
      course: { enrollments: { some: { userId } } },
      dueDate: { gte: new Date() },
      submissions: { none: { userId } }, // Only fetch tasks that aren't submitted yet
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    select: {
      id: true,
      title: true,
      dueDate: true,
      course: { select: { title: true, slug: true } },
    },
  });

  // Fetch recent announcements
  const recentAnnouncements = await prisma.announcement.findMany({
    where: {
      course: { enrollments: { some: { userId } } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      course: { select: { title: true, slug: true } }
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
          Welcome back, {session.user.name || "Student"}! 👋
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Here&apos;s your learning progress overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800">
          <BookOpen className="w-8 h-8 text-primary-500 mb-3" />
          <div className="text-2xl font-bold text-surface-900 dark:text-white">{enrollments.length}</div>
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

      {/* Dashboard Widgets (Goals, Deadlines, Announcements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DailyGoalsWidget />
        <UpcomingDeadlinesWidget tasks={JSON.parse(JSON.stringify(upcomingTasks))} />
        <RecentAnnouncementsWidget announcements={JSON.parse(JSON.stringify(recentAnnouncements))} />
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">My Courses</h2>
          <Link
            href="/learn/courses"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            Browse more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No Courses Yet</h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">Start your learning journey by enrolling in a course.</p>
            <Link
              href="/learn/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all"
            >
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithProgress.map((course) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                category={course.category}
                difficulty={course.difficulty}
                lessonCount={course._count.lessons}
                enrollmentCount={course._count.enrollments}
                progress={course.progress}
                isEnrolled
              />
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      {enrollments.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Course Progress</h3>
          <div className="space-y-4">
            {coursesWithProgress.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-white truncate text-sm">{course.title}</p>
                </div>
                <div className="w-48">
                  <ProgressBar progress={course.progress} size="sm" showLabel={false} />
                </div>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 w-12 text-right">
                  {course.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
