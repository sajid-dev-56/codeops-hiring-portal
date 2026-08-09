"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

export default function AddQuizForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      timeLimit: formData.get("timeLimit"),
      startTime: formData.get("startTime") || null,
      endTime: formData.get("endTime") || null,
    };

    try {
      const res = await fetch(`/api/learn/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create quiz");

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-surface-300 dark:border-surface-700 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Add Quiz
      </button>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-surface-900 dark:text-white">New Quiz</h3>
        <button onClick={() => setIsOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Title</label>
          <input
            name="title"
            required
            className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="e.g. JavaScript Basics Quiz"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Description (Optional)</label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="Brief instructions..."
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Time Limit (Seconds per question)</label>
          <input
            type="number"
            name="timeLimit"
            required
            defaultValue="20"
            className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Start Time (Optional)</label>
            <input
              type="datetime-local"
              name="startTime"
              className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">End Time (Optional)</label>
            <input
              type="datetime-local"
              name="endTime"
              className="w-full px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-danger-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
