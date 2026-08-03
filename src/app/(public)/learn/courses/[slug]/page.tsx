import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, Users, Signal, CheckCircle2, ListTodo, Megaphone, ArrowRight } from "lucide-react";
import AnnouncementCard from "@/components/learn/AnnouncementCard";
import EnrollButton from "@/components/learn/EnrollButton";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.description.slice(0, 160),
  };
}

const difficultyConfig = {
  BEGINNER: { label: "Beginner", color: "bg-success-500/10 text-success-600 dark:text-success-400 border-success-500/20" },
  INTERMEDIATE: { label: "Intermediate", color: "bg-warning-500/10 text-warning-600 dark:text-warning-400 border-warning-500/20" },
  ADVANCED: { label: "Advanced", color: "bg-danger-500/10 text-danger-600 dark:text-danger-400 border-danger-500/20" },
};

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      lessons: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      announcements: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { enrollments: true, lessons: true, tasks: true } },
    },
  });

  if (!course) notFound();

  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const diff = difficultyConfig[course.difficulty];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mb-8">
          <Link href="/learn" className="hover:text-primary-600 transition-colors">Learning Hub</Link>
          <span>/</span>
          <Link href="/learn/courses" className="hover:text-primary-600 transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-surface-900 dark:text-white font-medium truncate">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${diff.color}`}>
                  {diff.label}
                </span>
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                  {course.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Clock className="w-5 h-5" />, value: course._count.lessons, label: "Lessons" },
                { icon: <ListTodo className="w-5 h-5" />, value: course._count.tasks, label: "Tasks" },
                { icon: <Users className="w-5 h-5" />, value: course._count.enrollments, label: "Enrolled" },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 text-center border border-surface-200 dark:border-surface-700">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-surface-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Lesson List */}
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary-500" />
                Course Lessons
              </h2>
              {course.lessons.length === 0 ? (
                <div className="text-center py-10 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700">
                  <p className="text-surface-500">Lessons will be available after enrollment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-primary-500/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white truncate">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-0.5">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-400">
                        {lesson.videoUrl ? (
                          <span className="px-2 py-1 rounded bg-success-500/10 text-success-600 dark:text-success-400 font-medium">Video</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-surface-400 font-medium">Text</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks List */}
            {course.tasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <ListTodo className="w-6 h-6 text-accent-500" />
                  Assignments & Tasks
                </h2>
                <div className="space-y-2">
                  {course.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        T{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400 truncate mt-0.5">{task.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{task.maxMarks}</span>
                        <span className="text-xs text-surface-400 ml-1">marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enroll CTA */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sticky top-24">
              <div className="text-center mb-6">
                <Signal className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Ready to Learn?</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Sign in and enroll to access all lessons, submit tasks, and climb the leaderboard.
                </p>
              </div>

              {!session ? (
                <Link
                  href={`/login?callbackUrl=/learn/courses/${course.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
                >
                  Sign in to Enroll
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                Free to enroll
              </div>
            </div>

            {/* Announcements */}
            {course.announcements.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary-500" />
                  Announcements
                </h3>
                <div className="space-y-3">
                  {course.announcements.map((ann) => (
                    <AnnouncementCard
                      key={ann.id}
                      title={ann.title}
                      content={ann.content}
                      createdAt={ann.createdAt}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
