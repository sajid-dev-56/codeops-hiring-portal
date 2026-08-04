import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Award, Clock, AlertTriangle } from "lucide-react";
import TaskSubmissionForm from "@/components/learn/TaskSubmissionForm";

interface Props {
  params: Promise<{ taskId: string }>;
}

function getDueStatusInfo(dueDate: Date) {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffHours / 24);

  if (diffMs < 0) {
    return {
      label: "Overdue",
      sublabel: `Was due ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago`,
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-500/10 border-danger-500/20",
      iconColor: "text-danger-500",
      Icon: AlertTriangle,
    };
  }
  if (diffHours <= 48) {
    return {
      label: "Due Soon",
      sublabel: diffHours <= 24 ? "Due within 24 hours" : `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-500/10 border-warning-500/20",
      iconColor: "text-warning-500",
      Icon: Clock,
    };
  }
  return {
    label: "On Time",
    sublabel: `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`,
    color: "text-success-600 dark:text-success-400",
    bg: "bg-success-500/10 border-success-500/20",
    iconColor: "text-success-500",
    Icon: Calendar,
  };
}

function getSubmissionStatusBadge(status: string | undefined) {
  switch (status) {
    case "GRADED":
      return { label: "Graded", bg: "bg-success-500/10", color: "text-success-600 dark:text-success-400" };
    case "AI_GRADED":
      return { label: "AI Graded", bg: "bg-primary-500/10", color: "text-primary-600 dark:text-primary-400" };
    case "PENDING":
      return { label: "Pending Review", bg: "bg-amber-500/10", color: "text-amber-600 dark:text-amber-400" };
    case "RESUBMIT":
      return { label: "Resubmit Required", bg: "bg-warning-500/10", color: "text-warning-600 dark:text-warning-400" };
    default:
      return { label: "Not Submitted", bg: "bg-surface-500/10", color: "text-surface-500 dark:text-surface-400" };
  }
}

export default async function TaskDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { taskId } = await params;
  const userId = session.user.id;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      course: {
        select: { id: true, title: true, slug: true },
      },
      submissions: {
        where: { userId },
      },
    },
  });

  if (!task) notFound();

  // Verify enrollment
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: task.courseId,
        },
      },
    });

    if (!enrollment) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Not Enrolled</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              You need to enroll in this course to view this task.
            </p>
            <Link
              href={`/learn/dashboard/courses/${task.course.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all"
            >
              Go to Course
            </Link>
          </div>
        </div>
      );
    }
  }

  const submission = task.submissions[0] || null;
  const statusBadge = getSubmissionStatusBadge(submission?.status);
  const dueInfo = task.dueDate ? getDueStatusInfo(new Date(task.dueDate)) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
        <Link href="/learn/dashboard" className="hover:text-primary-600 transition-colors">
          Dashboard
        </Link>
        <span className="text-surface-300 dark:text-surface-600">/</span>
        <Link
          href={`/learn/dashboard/courses/${task.course.slug}`}
          className="hover:text-primary-600 transition-colors"
        >
          {task.course.title}
        </Link>
        <span className="text-surface-300 dark:text-surface-600">/</span>
        <span className="text-surface-900 dark:text-white font-medium truncate">{task.title}</span>
      </nav>

      {/* Back Button + Title */}
      <div className="flex items-start gap-4">
        <Link
          href={`/learn/dashboard/courses/${task.course.slug}`}
          className="mt-1.5 flex-shrink-0 w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-300" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-tight">
            {task.title}
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {task.course.title}
          </p>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Max Marks */}
        <div className="flex items-center gap-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 px-5 py-4">
          <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-medium">Max Marks</p>
            <p className="text-xl font-bold text-surface-900 dark:text-white">{task.maxMarks}</p>
          </div>
        </div>

        {/* Due Date */}
        <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${dueInfo ? dueInfo.bg : "bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800"}`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dueInfo ? dueInfo.bg : "bg-surface-500/10"}`}>
            {dueInfo ? <dueInfo.Icon className={`w-5 h-5 ${dueInfo.iconColor}`} /> : <Calendar className="w-5 h-5 text-surface-400" />}
          </div>
          <div>
            <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-medium">Due Date</p>
            {task.dueDate ? (
              <>
                <p className={`text-sm font-bold ${dueInfo?.color || ""}`}>
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className={`text-xs mt-0.5 ${dueInfo?.color || "text-surface-400"}`}>{dueInfo?.sublabel}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-surface-400">No deadline</p>
            )}
          </div>
        </div>

        {/* Submission Status */}
        <div className="flex items-center gap-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 px-5 py-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${statusBadge.bg}`}>
            <div className={`w-3 h-3 rounded-full ${submission?.status === "GRADED" ? "bg-success-500" : submission?.status === "PENDING" ? "bg-amber-500 animate-pulse" : submission?.status === "AI_GRADED" ? "bg-primary-500" : submission?.status === "RESUBMIT" ? "bg-warning-500" : "bg-surface-400"}`} />
          </div>
          <div>
            <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-medium">Status</p>
            <p className={`text-sm font-bold ${statusBadge.color}`}>{statusBadge.label}</p>
            {submission?.marks !== null && submission?.marks !== undefined && (
              <p className="text-xs text-surface-400 mt-0.5">Score: {submission.marks}/{task.maxMarks}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submission Form with Full Details */}
      <TaskSubmissionForm
        taskId={task.id}
        taskTitle={task.title}
        maxMarks={task.maxMarks}
        description={task.description}
        dueDate={task.dueDate}
        showDetails={true}
        existingSubmission={submission}
      />
    </div>
  );
}
