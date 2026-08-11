import { BookOpen, Trophy, CheckCircle2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header Skeleton */}
      <div>
        <div className="h-8 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-surface-100 dark:bg-surface-800/50 rounded-lg animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 h-[120px] animate-pulse" />
        ))}
      </div>

      {/* Dashboard Widgets Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[300px] bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
        ))}
      </div>

      {/* Enrolled Courses Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
