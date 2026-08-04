import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Award,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Bot,
  CircleDot,
} from "lucide-react";

function getStatusConfig(status: string | undefined) {
  switch (status) {
    case "GRADED":
      return {
        label: "Graded",
        bg: "bg-success-500/10",
        color: "text-success-600 dark:text-success-400",
        Icon: CheckCircle2,
        priority: 4,
      };
    case "AI_GRADED":
      return {
        label: "AI Graded",
        bg: "bg-primary-500/10",
        color: "text-primary-600 dark:text-primary-400",
        Icon: Bot,
        priority: 3,
      };
    case "PENDING":
      return {
        label: "Pending Review",
        bg: "bg-amber-500/10",
        color: "text-amber-600 dark:text-amber-400",
        Icon: Loader2,
        priority: 2,
      };
    case "RESUBMIT":
      return {
        label: "Resubmit Required",
        bg: "bg-warning-500/10",
        color: "text-warning-600 dark:text-warning-400",
        Icon: RotateCcw,
        priority: 1,
      };
    default:
      return {
        label: "Not Submitted",
        bg: "bg-surface-500/10",
        color: "text-surface-500 dark:text-surface-400",
        Icon: CircleDot,
        priority: 0,
      };
  }
}

export default async function MyTasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Get all courses the student is enrolled in, with their tasks
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          tasks: {
            orderBy: { createdAt: "desc" },
            include: {
              submissions: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  // Flatten all tasks with course info
  const allTasks = enrollments.flatMap((enrollment) =>
    enrollment.course.tasks.map((task) => ({
      ...task,
      courseName: enrollment.course.title,
      courseSlug: enrollment.course.slug,
      submission: task.submissions[0] || null,
    }))
  );

  // Sort: resubmit first, then not submitted, then pending, then AI graded, then graded
  allTasks.sort((a, b) => {
    const aPriority = getStatusConfig(a.submission?.status).priority;
    const bPriority = getStatusConfig(b.submission?.status).priority;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Secondary sort: by due date (sooner first)
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const pendingCount = allTasks.filter(
    (t) => !t.submission || t.submission.status === "RESUBMIT"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            {allTasks.length} total task{allTasks.length !== 1 ? "s" : ""} across all courses
            {pendingCount > 0 && (
              <span className="ml-2 text-warning-600 dark:text-warning-400 font-medium">
                · {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {allTasks.length === 0 && (
        <div className="text-center py-20">
          <ClipboardList className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
            No tasks yet
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            Tasks will appear here once your instructors assign them to your enrolled courses.
          </p>
          <Link
            href="/learn/dashboard/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all"
          >
            Browse My Courses
          </Link>
        </div>
      )}

      {/* Tasks List */}
      {allTasks.length > 0 && (
        <div className="space-y-3">
          {allTasks.map((task) => {
            const statusConfig = getStatusConfig(task.submission?.status);
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false;
            const isDueSoon =
              dueDate
                ? (dueDate.getTime() - Date.now()) / (1000 * 60 * 60) <= 48 && !isOverdue
                : false;

            return (
              <Link
                key={task.id}
                href={`/learn/dashboard/tasks/${task.id}`}
                className="group block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}
                  >
                    <statusConfig.Icon
                      className={`w-5 h-5 ${statusConfig.color} ${
                        task.submission?.status === "PENDING" ? "animate-spin" : ""
                      }`}
                    />
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {task.title}
                      </h3>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-1 mb-1.5">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                      {/* Course Name */}
                      <span className="inline-flex items-center gap-1 text-primary-500/70 font-medium">
                        {task.courseName}
                      </span>
                      <span className="text-surface-200 dark:text-surface-700">·</span>
                      {/* Marks */}
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {task.submission?.marks !== null && task.submission?.marks !== undefined
                          ? `${task.submission.marks}/${task.maxMarks}`
                          : `${task.maxMarks} marks`}
                      </span>
                      {/* Due Date */}
                      {dueDate && (
                        <>
                          <span className="text-surface-200 dark:text-surface-700">·</span>
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isOverdue
                                ? "text-danger-500"
                                : isDueSoon
                                ? "text-warning-500"
                                : ""
                            }`}
                          >
                            {isOverdue ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : isDueSoon ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <Calendar className="w-3.5 h-3.5" />
                            )}
                            {isOverdue ? "Overdue — " : isDueSoon ? "Due soon — " : ""}
                            {dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
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
      )}
    </div>
  );
}
