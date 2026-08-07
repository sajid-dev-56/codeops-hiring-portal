export default function TasksLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-40 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
        </div>
        
        {/* Filter Buttons Skeleton */}
        <div className="flex p-1 bg-surface-100 dark:bg-surface-800/50 rounded-xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mx-1" />
          ))}
        </div>
      </div>

      {/* Task List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-3/4 max-w-md bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                <div className="h-5 w-20 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-1/3 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              <div className="flex items-center gap-4 pt-2">
                <div className="h-4 w-24 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-full sm:w-32 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
