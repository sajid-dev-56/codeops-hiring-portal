import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Users, Signal } from "lucide-react";

interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lessonCount: number;
  enrollmentCount: number;
  progress?: number; // 0-100 for enrolled students
  isEnrolled?: boolean;
}

const difficultyConfig = {
  BEGINNER: { label: "Beginner", color: "bg-success-500/10 text-success-600 dark:text-success-400 border-success-500/20" },
  INTERMEDIATE: { label: "Intermediate", color: "bg-warning-500/10 text-warning-600 dark:text-warning-400 border-warning-500/20" },
  ADVANCED: { label: "Advanced", color: "bg-danger-500/10 text-danger-600 dark:text-danger-400 border-danger-500/20" },
};

export default function CourseCard({
  slug,
  title,
  description,
  thumbnail,
  category,
  difficulty,
  lessonCount,
  enrollmentCount,
  progress,
  isEnrolled,
}: CourseCardProps) {
  const diffStyle = difficultyConfig[difficulty];

  return (
    <Link
      href={isEnrolled ? `/learn/dashboard/courses/${slug}` : `/learn/courses/${slug}`}
      className="group block"
    >
      <div className="h-full bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 overflow-hidden flex flex-col">
        {/* Thumbnail / Gradient Header */}
        <div className="h-40 relative overflow-hidden bg-surface-100 dark:bg-surface-800">
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-primary-600/20 dark:from-primary-500/10 dark:via-accent-500/10 dark:to-primary-600/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent dark:from-surface-900/90 dark:via-surface-900/20" />
          
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${diffStyle.color} bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm`}>
              {diffStyle.label}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm text-surface-700 dark:text-surface-300 border border-surface-200/50 dark:border-surface-700/50">
              {category}
            </span>
          </div>
          {isEnrolled && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-500 text-white shadow-sm">
                Enrolled
              </span>
            </div>
          )}
          {!thumbnail && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <BookOpen className="w-8 h-8 text-primary-500 dark:text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Progress bar for enrolled courses */}
          {typeof progress === "number" && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-surface-500 dark:text-surface-400">Progress</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400 pt-4 border-t border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{enrollmentCount} Enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Signal className="w-3.5 h-3.5" />
              <span>{diffStyle.label}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
