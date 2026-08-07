import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
              <div className="h-5 w-24 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Courses Skeleton */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
            <div className="h-6 w-32 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
                  <div className="w-24 h-16 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
            <div className="h-6 w-40 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
