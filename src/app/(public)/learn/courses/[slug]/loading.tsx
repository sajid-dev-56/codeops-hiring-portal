export default function CourseDetailsLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Course Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-4 w-32 bg-surface-200 dark:bg-surface-800 rounded mb-2 animate-pulse" />
          <div className="h-8 w-64 md:w-96 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
        </div>
        <div className="w-48 h-10 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-48 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
              <div className="h-8 w-32 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
            </div>
            <div className="aspect-video w-full bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
          </div>

          <div>
            <div className="h-6 w-48 bg-surface-200 dark:bg-surface-800 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 w-full bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl h-64 animate-pulse" />
          <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl h-48 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
