"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface LessonCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export default function LessonCompleteButton({ lessonId, isCompleted }: LessonCompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    const newStatus = !completed;

    try {
      const res = await fetch("/api/learn/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark progress");
      }

      setCompleted(newStatus);
      toast.success(newStatus ? "Lesson marked as complete!" : "Lesson marked as incomplete!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark complete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        completed
          ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 hover:bg-success-200 dark:hover:bg-success-900/50"
          : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-success-100 dark:hover:bg-success-900/30 hover:text-success-700 dark:hover:text-success-400"
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : completed ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {completed ? "Completed" : "Mark Complete"}
    </button>
  );
}
