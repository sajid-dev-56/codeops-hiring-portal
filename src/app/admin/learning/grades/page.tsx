import { prisma } from "@/lib/prisma";
import GradeSubmissionCard from "./GradeSubmissionCard";
import { ClipboardCheck } from "lucide-react";

export default async function AdminGradesPage() {
  const submissions = await prisma.taskSubmission.findMany({
    where: { status: { in: ["PENDING", "AI_GRADED"] } },
    include: {
      user: { select: { name: true, email: true } },
      task: {
        select: {
          id: true,
          title: true,
          maxMarks: true,
          description: true,
          course: { select: { title: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Grade Submissions</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Review AI-graded work and approve or adjust marks</p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <ClipboardCheck className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">All Caught Up!</h3>
          <p className="text-surface-500 dark:text-surface-400">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <GradeSubmissionCard
              key={sub.id}
              submission={{
                id: sub.id,
                content: sub.content,
                linkUrl: sub.linkUrl,
                status: sub.status,
                aiMarks: sub.aiMarks,
                aiFeedback: sub.aiFeedback,
                submittedAt: sub.submittedAt.toISOString(),
              }}
              student={{ name: sub.user.name || "Anonymous", email: sub.user.email }}
              task={{
                id: sub.task.id,
                title: sub.task.title,
                maxMarks: sub.task.maxMarks,
                courseName: sub.task.course.title,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


export const dynamic = "force-dynamic";
