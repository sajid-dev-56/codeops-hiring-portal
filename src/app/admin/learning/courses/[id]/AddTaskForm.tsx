"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddTaskForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    maxMarks: "100",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/learn/courses/${courseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxMarks: parseInt(form.maxMarks),
          dueDate: form.dueDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add task");
      }

      toast.success("Task added!");
      setForm({ title: "", description: "", maxMarks: "100", dueDate: "" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-700 text-surface-500 hover:border-accent-500 hover:text-accent-500 transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Task
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
        placeholder="Task title"
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        required
        placeholder="Task description & instructions"
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-surface-500 mb-1">Max Marks</label>
          <input
            type="number"
            value={form.maxMarks}
            onChange={(e) => setForm((p) => ({ ...p, maxMarks: e.target.value }))}
            min="1"
            max="1000"
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-surface-500 mb-1">Due Date (optional)</label>
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:border-primary-500 outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? "Adding..." : "Add Task"}
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
