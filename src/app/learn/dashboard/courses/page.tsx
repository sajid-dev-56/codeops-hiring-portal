import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CourseCard from "@/components/learn/CourseCard";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true, enrollments: true } },
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const completedLessonIds = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedLessonIds.map((c) => c.lessonId));

  const coursesWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course._count.lessons;
    const completedLessons = enrollment.course.lessons.filter((l) => completedSet.has(l.id)).length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { ...enrollment.course, progress };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">My Courses</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">Courses you are enrolled in</p>
        </div>
        <Link
          href="/learn/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all"
        >
          Browse More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {coursesWithProgress.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Courses Yet</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Enroll in your first course to start learning!</p>
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
  );
}
