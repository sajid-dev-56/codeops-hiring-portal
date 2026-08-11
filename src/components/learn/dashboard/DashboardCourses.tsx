import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import CourseCard from "@/components/learn/CourseCard";
import ProgressBar from "@/components/learn/ProgressBar";

export default async function DashboardCourses({ userId }: { userId: string }) {
  // Get enrolled courses with progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true, enrollments: true, tasks: true } },
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // Get lesson completions
  const completedLessonIds = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedLessonIds.map((c) => c.lessonId));

  // Build course data with progress
  const coursesWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course._count.lessons;
    const completedLessons = enrollment.course.lessons.filter((l) => completedSet.has(l.id)).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { ...enrollment.course, progress };
  });

  return (
    <div className="space-y-8">
      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">My Courses</h2>
          <Link
            href="/learn/courses"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            Browse more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No Courses Yet</h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">Start your learning journey by enrolling in a course.</p>
            <Link
              href="/learn/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all"
            >
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithProgress.map((course) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                category={course.category}
                difficulty={course.difficulty}
                lessonCount={course._count.lessons}
                enrollmentCount={course._count.enrollments}
                progress={course.progress}
                isEnrolled
              />
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      {enrollments.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Course Progress</h3>
          <div className="space-y-4">
            {coursesWithProgress.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 dark:text-white truncate text-sm">{course.title}</p>
                </div>
                <div className="w-48">
                  <ProgressBar progress={course.progress} size="sm" showLabel={false} />
                </div>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 w-12 text-right">
                  {course.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
