export default function TaskDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Back Button Skeleton */}
      <div className="h-6 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />

      {/* Main Card Skeleton */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        {/* Header Skeleton */}
        <div className="p-8 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
            <div className="flex-1 space-y-3">
              <div className="h-8 w-3/4 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-5 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                <div className="h-5 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-32 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
          </div>
          
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          </div>
          <div className="h-32 w-full bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
