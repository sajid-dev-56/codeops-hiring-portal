import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Calendar, Star, Users } from "lucide-react";

export default async function AdminTasksPage() {
  const tasks = await prisma.task.findMany({
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Tasks / Assignments</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Manage assignments across all courses</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Task Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Course</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Due Date</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Max Marks</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Submissions</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-surface-900 dark:text-white">{task.title}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                      {task.course.title}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {task.dueDate ? (
                      <div className="flex items-center justify-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-surface-400">No due date</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                      <Star className="w-3.5 h-3.5" />
                      {task.maxMarks}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                      <Users className="w-3.5 h-3.5" />
                      {task._count.submissions}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/learning/courses/${task.course.id}`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                    >
                      View Course →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
