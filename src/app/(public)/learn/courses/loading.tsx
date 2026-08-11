import { BookOpen } from "lucide-react";

export default function CoursesLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center py-12 bg-surface-100 dark:bg-surface-800 rounded-3xl animate-pulse h-48" />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="h-10 flex-1 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
