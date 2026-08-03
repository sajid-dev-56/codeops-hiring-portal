import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen, Users, Eye, EyeOff } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { lessons: true, tasks: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Courses</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">Manage your learning courses</p>
        </div>
        <Link
          href="/admin/learning/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Courses Yet</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Create your first course to get started.</p>
          <Link
            href="/admin/learning/courses/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Category</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Lessons</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Tasks</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Enrolled</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{course.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{course.difficulty}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-surface-600 dark:text-surface-400">{course._count.lessons}</td>
                    <td className="px-5 py-4 text-center text-sm text-surface-600 dark:text-surface-400">{course._count.tasks}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                        <Users className="w-3.5 h-3.5" />
                        {course._count.enrollments}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {course.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-success-100 dark:bg-success-900/50 text-success-600 dark:text-success-400">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/learning/courses/${course.id}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
