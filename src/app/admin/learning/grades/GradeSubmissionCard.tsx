"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  submission: {
    id: string;
    content: string | null;
    linkUrl: string | null;
    status: string;
    aiMarks: number | null;
    aiFeedback: string | null;
    submittedAt: string;
  };
  student: { name: string; email: string };
  task: { id: string; title: string; maxMarks: number; courseName: string };
}

export default function GradeSubmissionCard({ submission, student, task }: Props) {
  const router = useRouter();
  const [marks, setMarks] = useState(submission.aiMarks?.toString() || "");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGrade = async (status: "GRADED" | "RESUBMIT") => {
    if (status === "GRADED" && !marks) {
      toast.error("Please enter marks");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/learn/tasks/${task.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          marks: parseInt(marks) || 0,
          feedback,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to grade");
      }

      toast.success(status === "GRADED" ? "Submission graded!" : "Resubmission requested!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to grade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-surface-900 dark:text-white">{student.name}</p>
            <p className="text-sm text-surface-500">{student.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{task.courseName}</p>
            <p className="text-xs text-surface-400">{task.title}</p>
          </div>
        </div>
      </div>

      {/* Submission Content */}
      <div className="px-6 py-4 space-y-3">
        {submission.linkUrl && (
          <div className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline break-all">
              {submission.linkUrl}
            </a>
          </div>
        )}
        {submission.content && (
          <div className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg p-3">
            {submission.content}
          </div>
        )}

        {/* AI Grade */}
        {submission.status === "AI_GRADED" && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">🤖 AI Suggested Grade</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{submission.aiMarks}/{task.maxMarks}</span>
            </div>
            {submission.aiFeedback && (
              <p className="text-xs text-surface-600 dark:text-surface-400 whitespace-pre-line">{submission.aiFeedback}</p>
            )}
          </div>
        )}
      </div>

      {/* Grading Form */}
      <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">Marks (max {task.maxMarks})</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              min="0"
              max={task.maxMarks}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">Feedback (optional)</label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Great work! / Needs improvement..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleGrade("GRADED")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-success-600 hover:bg-success-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve & Grade
          </button>
          <button
            onClick={() => handleGrade("RESUBMIT")}
            disabled={loading}
            className="flex items-center gap-2 py-2 px-4 rounded-lg bg-warning-600 hover:bg-warning-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Resubmit
          </button>
        </div>
      </div>
    </div>
  );
}
