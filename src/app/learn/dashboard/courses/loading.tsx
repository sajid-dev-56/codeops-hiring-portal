import { BookOpen, Search } from "lucide-react";

export default function CoursesLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-surface-200 dark:bg-surface-800 rounded-xl animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden h-[340px]"
          >
            {/* Thumbnail Skeleton */}
            <div className="h-40 bg-surface-200 dark:bg-surface-800 animate-pulse" />
            
            <div className="p-5 flex flex-col flex-1">
              {/* Badges Skeleton */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-surface-200 dark:bg-surface-800 rounded-full animate-pulse" />
              </div>
              
              {/* Title Skeleton */}
              <div className="h-6 w-3/4 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse mb-3" />
              
              {/* Description Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                <div className="h-4 w-5/6 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              </div>
              
              {/* Footer Skeleton */}
              <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="h-4 w-12 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-12 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-surface-200 dark:bg-surface-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
