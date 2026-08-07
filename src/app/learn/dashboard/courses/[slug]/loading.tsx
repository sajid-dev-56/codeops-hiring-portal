export default function CourseDetailLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Course Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-20 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
        </div>
        <div className="w-48 h-12 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 w-3/4 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
            </div>
            <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse mb-4" />
            <div className="aspect-video w-full bg-surface-200 dark:bg-surface-800 rounded-2xl animate-pulse" />
          </div>

          <div>
            <div className="h-7 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 w-full bg-surface-200 dark:bg-surface-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
              <div className="h-5 w-32 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-5 py-4 flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-surface-200 dark:bg-surface-800 flex-shrink-0 animate-pulse" />
                  <div className="h-5 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
