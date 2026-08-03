"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function GradeModal({
  submission,
  isOpen,
  onClose,
  onSuccess,
}: {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}) {
  const [marks, setMarks] = useState<string>(submission?.marks?.toString() || "");
  const [status, setStatus] = useState<string>(submission?.status || "GRADED");
  const [feedback, setFeedback] = useState<string>(submission?.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marks: marks ? parseInt(marks) : null,
          status,
          feedback,
        }),
      });

      if (!res.ok) throw new Error("Failed to update submission");

      const data = await res.json();
      onSuccess(data.submission);
    } catch (error) {
      console.error(error);
      alert("Failed to update grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-surface-200 dark:border-surface-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            Update Grade
          </h2>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-surface-500 mb-1">Task</p>
              <p className="font-medium text-surface-900 dark:text-white">{submission.task?.title}</p>
            </div>
            
            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <p className="text-sm font-medium text-surface-500 mb-2">Student's Submission</p>
              {submission.content ? (
                <p className="text-sm text-surface-700 dark:text-surface-300">{submission.content}</p>
              ) : (
                <p className="text-sm text-surface-400 italic">No text provided.</p>
              )}
              {submission.linkUrl && (
                <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary-600 hover:underline">
                  View Attachment / Link ↗
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Marks (out of {submission.task?.maxMarks || 100})
                </label>
                <input
                  type="number"
                  min="0"
                  max={submission.task?.maxMarks || 100}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors dark:text-white"
                  placeholder="e.g. 85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors dark:text-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="AI_GRADED">AI Graded</option>
                  <option value="GRADED">Graded</option>
                  <option value="RESUBMIT">Needs Resubmission</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Instructor Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors dark:text-white resize-none"
                placeholder="Leave feedback for the student..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-500 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
