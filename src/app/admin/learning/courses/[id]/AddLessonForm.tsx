"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddLessonForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoType: "DRIVE" as "DRIVE" | "YOUTUBE" | "EXTERNAL_LINK",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/learn/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add lesson");
      }

      toast.success("Lesson added!");
      setForm({ title: "", description: "", videoUrl: "", videoType: "DRIVE" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-700 text-surface-500 hover:border-primary-500 hover:text-primary-500 transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Lesson
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-3 border border-surface-200 dark:border-surface-700">
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        required
        placeholder="Lesson title"
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
          placeholder="Video URL (Google Drive link)"
          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none"
        />
        <select
          value={form.videoType}
          onChange={(e) => setForm((p) => ({ ...p, videoType: e.target.value as typeof form.videoType }))}
          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:border-primary-500 outline-none"
        >
          <option value="DRIVE">Google Drive</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="EXTERNAL_LINK">External Link</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? "Adding..." : "Add Lesson"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-sm font-medium hover:bg-surface-300 dark:hover:bg-surface-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
