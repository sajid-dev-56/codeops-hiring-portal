"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description: string;
    maxMarks: number;
    dueDate: Date | null;
  };
}

export default function EditTaskForm({ task }: EditTaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    maxMarks: task.maxMarks.toString(),
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    dueDate: task.dueDate
      ? new Date(new Date(task.dueDate).getTime() - new Date(task.dueDate).getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxMarks: parseInt(form.maxMarks),
          dueDate: form.dueDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task");
      }

      toast.success("Task updated!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        title="Edit Task"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="w-full mt-2">
      <form onSubmit={handleSubmit} className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-3 border border-surface-200 dark:border-surface-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-surface-900 dark:text-white">Edit Task</h4>
          <button type="button" onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        
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
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
