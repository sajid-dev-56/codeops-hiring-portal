"use client";

import { useState } from "react";
import { Send, ExternalLink, Loader2, Clock, FileText, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface TaskSubmissionFormProps {
  taskId: string;
  taskTitle: string;
  maxMarks: number;
  description?: string | null;
  dueDate?: string | Date | null;
  showDetails?: boolean;
  existingSubmission?: {
    id: string;
    content: string | null;
    linkUrl: string | null;
    status: string;
    marks: number | null;
    aiMarks: number | null;
    feedback: string | null;
    aiFeedback: string | null;
  } | null;
  onSubmitted?: () => void;
}

function getDueStatus(dueDate: Date) {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return { label: "Overdue", color: "text-danger-600 dark:text-danger-400", bg: "bg-danger-500/10", icon: AlertTriangle };
  if (diffHours <= 48) return { label: "Due Soon", color: "text-warning-600 dark:text-warning-400", bg: "bg-warning-500/10", icon: Clock };
  return { label: "On Time", color: "text-success-600 dark:text-success-400", bg: "bg-success-500/10", icon: Clock };
}

export default function TaskSubmissionForm({
  taskId,
  taskTitle,
  maxMarks,
  description,
  dueDate,
  showDetails = false,
  existingSubmission,
  onSubmitted,
}: TaskSubmissionFormProps) {
  const parsedDueDate = dueDate ? new Date(dueDate) : null;
  const dueStatus = parsedDueDate ? getDueStatus(parsedDueDate) : null;
  const [linkUrl, setLinkUrl] = useState(existingSubmission?.linkUrl || "");
  const [content, setContent] = useState(existingSubmission?.content || "");
  const [loading, setLoading] = useState(false);

  const isGraded = existingSubmission?.status === "GRADED";
  const isAiGraded = existingSubmission?.status === "AI_GRADED";
  const needsResubmit = existingSubmission?.status === "RESUBMIT";
  const isPending = existingSubmission?.status === "PENDING";
  const hasSubmitted = !!existingSubmission && !needsResubmit;
  const isOverdue = parsedDueDate ? parsedDueDate.getTime() < new Date().getTime() : false;
  const hasTimeLeft = parsedDueDate ? !isOverdue : false;
  const canSubmit = (!hasSubmitted || needsResubmit || hasTimeLeft) && !isOverdue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim() && !content.trim()) {
      toast.error("Please provide a link or a note");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/learn/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, linkUrl: linkUrl.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      toast.success("Task submitted successfully! AI is grading...");
      onSubmitted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
        <h3 className="font-semibold text-surface-900 dark:text-white text-lg">{taskTitle}</h3>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400">
            Maximum Marks: <span className="font-semibold text-primary-600 dark:text-primary-400">{maxMarks}</span>
          </span>
          {dueStatus && parsedDueDate && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${dueStatus.bg} ${dueStatus.color}`}>
              <dueStatus.icon className="w-3.5 h-3.5" />
              {dueStatus.label} — {parsedDueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Task Description — shown on detail page */}
      {showDetails && description && (
        <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">Task Instructions</h4>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-line">
            {description}
          </div>
        </div>
      )}

      {/* Graded Status Banner */}
      {isGraded && (
        <div className="px-6 py-4 bg-success-500/10 border-b border-success-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-success-600 dark:text-success-400">✅ Graded</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Your submission has been reviewed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {existingSubmission.marks}/{maxMarks}
              </p>
            </div>
          </div>
          {existingSubmission.feedback && (
            <div className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/50 text-sm text-surface-700 dark:text-surface-300 whitespace-pre-line">
              <p className="font-semibold mb-1">Instructor Feedback:</p>
              {existingSubmission.feedback}
            </div>
          )}
        </div>
      )}

      {/* AI Graded Banner */}
      {isAiGraded && (
        <div className="px-6 py-4 bg-primary-500/10 border-b border-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">🤖 AI Graded — Pending Instructor Review</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                AI has evaluated your work. Final marks pending instructor approval.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {existingSubmission.aiMarks}/{maxMarks}
              </p>
              <p className="text-xs text-surface-400">AI Score</p>
            </div>
          </div>
          {existingSubmission.aiFeedback && (
            <div className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/50 text-sm text-surface-700 dark:text-surface-300 whitespace-pre-line">
              <p className="font-semibold mb-1">AI Feedback:</p>
              {existingSubmission.aiFeedback}
            </div>
          )}
        </div>
      )}

      {/* Resubmit Banner */}
      {needsResubmit && !isOverdue && (
        <div className="px-6 py-4 bg-warning-500/10 border-b border-warning-500/20">
          <p className="text-sm font-semibold text-warning-600 dark:text-warning-400">⚠️ Resubmission Required</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Please update your submission based on the feedback below
          </p>
          {existingSubmission?.feedback && (
            <div className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/50 text-sm text-surface-700 dark:text-surface-300 whitespace-pre-line">
              {existingSubmission.feedback}
            </div>
          )}
        </div>
      )}

      {/* Overdue Banner */}
      {isOverdue && (
        <div className="px-6 py-4 bg-danger-500/10 border-b border-danger-500/20">
          <p className="text-sm font-semibold text-danger-600 dark:text-danger-400">🚨 Submission Closed</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            The deadline for this task has passed. You can no longer submit or edit your submission.
          </p>
        </div>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Link Input */}
          <div>
            <label htmlFor={`link-${taskId}`} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Submission Link <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="url"
                id={`link-${taskId}`}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://github.com/your-repo or https://linkedin.com/..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
            <p className="text-xs text-surface-400 mt-1.5">GitHub, LinkedIn, deployed URL, etc.</p>
          </div>

          {/* Short Note */}
          <div>
            <label htmlFor={`note-${taskId}`} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Short Note
            </label>
            <textarea
              id={`note-${taskId}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Briefly describe what you did, any challenges faced, or extra context..."
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
            />
            <p className="text-xs text-surface-400 mt-1 text-right">{content.length}/2000</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {needsResubmit || hasSubmitted ? "Update Submission" : "Submit Task"}
              </>
            )}
          </button>
        </form>
      )}

      {/* Already Submitted (Pending) */}
      {isPending && !canSubmit && (
        <div className="p-6">
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
            <p className="text-surface-600 dark:text-surface-300 font-medium">Submission Under Review</p>
            <p className="text-sm text-surface-400 mt-1">Your task is being graded by AI...</p>
          </div>
          {existingSubmission?.linkUrl && (
            <div className="mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-sm">
              <p className="text-surface-500 dark:text-surface-400 mb-1">Submitted Link:</p>
              <a href={existingSubmission.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline break-all">
                {existingSubmission.linkUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
