import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DailyGoalsWidget from "@/components/learn/DailyGoalsWidget";
import DashboardStats from "@/components/learn/dashboard/DashboardStats";
import DashboardCourses from "@/components/learn/dashboard/DashboardCourses";
import DashboardDeadlines from "@/components/learn/dashboard/DashboardDeadlines";
import DashboardAnnouncements from "@/components/learn/dashboard/DashboardAnnouncements";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

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
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-100 dark:bg-surface-800 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      }>
        <DashboardStats userId={userId} />
      </Suspense>

      {/* Dashboard Widgets (Goals, Deadlines, Announcements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DailyGoalsWidget />
        <Suspense fallback={<div className="h-[300px] bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />}>
          <DashboardDeadlines userId={userId} />
        </Suspense>
        <Suspense fallback={<div className="h-[300px] bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />}>
          <DashboardAnnouncements userId={userId} />
        </Suspense>
      </div>

      {/* Enrolled Courses & Progress */}
      <Suspense fallback={
        <div className="space-y-8">
          <div>
            <div className="h-8 w-48 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }>
        <DashboardCourses userId={userId} />
      </Suspense>
    </div>
  );
}
