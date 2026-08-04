"use client";

import { useState } from "react";
import { Loader2, X, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface TaskExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  enrollments: any[];
}

export default function TaskExtensionModal({
  isOpen,
  onClose,
  studentId,
  enrollments,
}: TaskExtensionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const selectedCourse = enrollments.find((e) => e.course.id === selectedCourseId)?.course;
  const tasks = selectedCourse?.tasks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !dueDate) {
      toast.error("Please select a task and a new due date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/extensions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTaskId,
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to grant extension");
      }

      toast.success("Deadline extended successfully!");
      onClose();
      // Optionally reset form
      setSelectedCourseId("");
      setSelectedTaskId("");
      setDueDate("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error granting extension");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-md border border-surface-200 dark:border-surface-800 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Extend Deadline
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedTaskId("");
              }}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:border-primary-500 outline-none"
            >
              <option value="" disabled>Select a course</option>
              {enrollments.map((e) => (
                <option key={e.course.id} value={e.course.id}>
                  {e.course.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourseId && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Select Task
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:border-primary-500 outline-none"
              >
                <option value="" disabled>Select a task</option>
                {tasks.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.dueDate ? `(Global Due: ${new Date(t.dueDate).toLocaleDateString()})` : "(No Due Date)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              New Extended Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:border-primary-500 outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTaskId || !dueDate}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Granting..." : "Grant Extension"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
