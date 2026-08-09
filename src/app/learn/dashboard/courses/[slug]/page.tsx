import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle2, Circle, ListTodo, Megaphone, ChevronRight, Calendar, Clock, Award, AlertTriangle } from "lucide-react";
import VideoPlayer from "@/components/learn/VideoPlayer";

import AnnouncementCard from "@/components/learn/AnnouncementCard";
import ProgressBar from "@/components/learn/ProgressBar";
import EnrollButton from "./EnrollButton";
import LessonCompleteButton from "./LessonCompleteButton";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function EnrolledCoursePage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const sp = await searchParams;
  const userId = session.user.id;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" } },
      tasks: {
        orderBy: { order: "asc" },
        include: {
          submissions: {
            where: { userId },
          },
        },
      },
      announcements: { orderBy: { createdAt: "desc" }, take: 5 },
      quizzes: {
        orderBy: { order: "asc" },
        include: {
          questions: true,
          attempts: {
            where: { userId },
          },
        },
      },
      _count: { select: { lessons: true, enrollments: true, tasks: true, quizzes: true } },
    },
  });

  if (!course) notFound();

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  if (!enrollment) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Not Enrolled</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            You need to enroll in this course to access its content.
          </p>
          <EnrollButton courseId={course.id} courseTitle={course.title} />
        </div>
      </div>
    );
  }

  // Get lesson completions
  const completions = await prisma.lessonCompletion.findMany({
    where: { userId, lesson: { courseId: course.id } },
    select: { lessonId: true },
  });
  const completedSet = new Set(completions.map((c) => c.lessonId));

  const progress = course.lessons.length > 0
    ? Math.round((completedSet.size / course.lessons.length) * 100)
    : 0;

  // Active lesson
  const activeLessonId = sp.lesson || course.lessons[0]?.id;
  const activeLesson = course.lessons.find((l) => l.id === activeLessonId) || course.lessons[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mb-2">
            <Link href="/learn/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-surface-900 dark:text-white font-medium truncate">{course.title}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">{course.title}</h1>
        </div>
        <div className="w-48">
          <ProgressBar progress={progress} size="md" label="Course Progress" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content — Video + Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player */}
          {activeLesson && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  {activeLesson.title}
                </h2>
                <LessonCompleteButton
                  lessonId={activeLesson.id}
                  isCompleted={completedSet.has(activeLesson.id)}
                />
              </div>
              {activeLesson.description && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">{activeLesson.description}</p>
              )}
              <VideoPlayer
                videoUrl={activeLesson.videoUrl || ""}
                videoType={activeLesson.videoType as "DRIVE" | "YOUTUBE" | "EXTERNAL_LINK"}
                title={activeLesson.title}
                allowDownload
              />
            </div>
          )}

          {/* Tasks / Assignments */}
          {course.tasks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-accent-500" />
                Tasks & Assignments
              </h2>
              <div className="space-y-3">
                {course.tasks.map((task) => {
                  const submission = task.submissions[0] || null;
                  const status = submission?.status;
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false;
                  const isDueSoon = dueDate ? (dueDate.getTime() - Date.now()) / (1000 * 60 * 60) <= 48 && !isOverdue : false;

                  // Status badge config
                  let statusLabel = "Not Submitted";
                  let statusBg = "bg-surface-500/10";
                  let statusColor = "text-surface-500 dark:text-surface-400";
                  if (status === "GRADED") { statusLabel = `Graded: ${submission?.marks}/${task.maxMarks}`; statusBg = "bg-success-500/10"; statusColor = "text-success-600 dark:text-success-400"; }
                  else if (status === "AI_GRADED") { statusLabel = "AI Graded"; statusBg = "bg-primary-500/10"; statusColor = "text-primary-600 dark:text-primary-400"; }
                  else if (status === "PENDING") { statusLabel = "Pending Review"; statusBg = "bg-amber-500/10"; statusColor = "text-amber-600 dark:text-amber-400"; }
                  else if (status === "RESUBMIT") { statusLabel = "Resubmit"; statusBg = "bg-warning-500/10"; statusColor = "text-warning-600 dark:text-warning-400"; }

                  return (
                    <Link
                      key={task.id}
                      href={`/learn/dashboard/tasks/${task.id}`}
                      className="group block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {task.title}
                            </h3>
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusBg} ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                            <span className="inline-flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {task.maxMarks} marks
                            </span>
                            {dueDate && (
                              <span className={`inline-flex items-center gap-1 ${isOverdue ? "text-danger-500" : isDueSoon ? "text-warning-500" : ""}`}>
                                {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : isDueSoon ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                {isOverdue ? "Overdue" : isDueSoon ? "Due soon" : ""}
                                {" "}
                                {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-surface-300 dark:text-surface-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {course.quizzes && course.quizzes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2 mt-8">
                <BookOpen className="w-5 h-5 text-success-500" />
                Quizzes
              </h2>
              <div className="space-y-3">
                {course.quizzes.map((quiz) => {
                  const attempt = quiz.attempts[0] || null;
                  const status = attempt?.status;
                  
                  let statusLabel = "Not Attempted";
                  let statusBg = "bg-surface-500/10";
                  let statusColor = "text-surface-500 dark:text-surface-400";
                  
                  if (status === "GRADED") { 
                    statusLabel = `Score: ${attempt?.score}%`; 
                    statusBg = attempt?.score && attempt.score >= 50 ? "bg-success-500/10" : "bg-danger-500/10"; 
                    statusColor = attempt?.score && attempt.score >= 50 ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"; 
                  }

                  return (
                    <Link
                      key={quiz.id}
                      href={`/learn/dashboard/courses/${slug}/quiz/${quiz.id}`}
                      className="group block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-success-300 dark:hover:border-success-700 hover:shadow-lg hover:shadow-success-500/5 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-surface-900 dark:text-white truncate group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors">
                              {quiz.title}
                            </h3>
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusBg} ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          {quiz.description && (
                            <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-2">
                              {quiz.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {quiz.questions.length} questions
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {quiz.timeLimit}s per question
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-surface-300 dark:text-surface-600 group-hover:text-success-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — Lesson List + Announcements */}
        <div className="space-y-6">
          {/* Lessons */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
              <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Lessons ({completedSet.size}/{course.lessons.length})
              </h3>
            </div>
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {course.lessons.map((lesson, index) => {
                const isActive = lesson.id === activeLessonId;
                const isCompleted = completedSet.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/dashboard/courses/${slug}?lesson=${lesson.id}`}
                    className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 ${
                      isActive ? "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-success-500" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isActive ? "text-primary-500" : "text-surface-300 dark:text-surface-600"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${isActive ? "font-medium text-primary-700 dark:text-primary-400" : "text-surface-700 dark:text-surface-300"}`}>
                        {index + 1}. {lesson.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
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
  );
}
