import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, ListTodo, Plus, Users, Eye, EyeOff } from "lucide-react";
import AddLessonForm from "./AddLessonForm";
import AddTaskForm from "./AddTaskForm";
import CourseActionsClient from "./CourseActionsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseDetailPage({ params }: Props) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-surface-500 mb-2">
            <Link href="/admin/learning/courses" className="hover:text-primary-600">Courses</Link>
            <span>/</span>
            <span className="text-surface-900 dark:text-white font-medium">{course.title}</span>
          </nav>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{course.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
              {course.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
              {course.difficulty}
            </span>
            {course.isPublished ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400">
                <Eye className="w-3 h-3" /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-200 dark:bg-surface-700 text-surface-500">
                <EyeOff className="w-3 h-3" /> Draft
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-surface-400">
              <Users className="w-3.5 h-3.5" /> {course._count.enrollments} enrolled
            </span>
          </div>
        </div>

        {/* Actions */}
        <CourseActionsClient 
          courseId={course.id} 
          isPublished={course.isPublished} 
          thumbnail={course.thumbnail} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lessons */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Lessons ({course.lessons.length})
            </h2>
          </div>

          {course.lessons.length > 0 && (
            <div className="space-y-2 mb-4">
              {course.lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{lesson.title}</p>
                    <p className="text-xs text-surface-400">{lesson.videoType} {lesson.videoUrl ? "• Has video" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddLessonForm courseId={course.id} />
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-accent-500" />
              Tasks ({course.tasks.length})
            </h2>
          </div>

          {course.tasks.length > 0 && (
            <div className="space-y-2 mb-4">
              {course.tasks.map((task, index) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                  <div className="w-7 h-7 rounded-full bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    T{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-surface-400">Max: {task.maxMarks} marks</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddTaskForm courseId={course.id} />
        </div>
      </div>
    </div>
  );
}


export const dynamic = "force-dynamic";
