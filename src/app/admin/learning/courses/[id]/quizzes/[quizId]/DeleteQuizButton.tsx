"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  quizId: string;
  courseId: string;
}

export default function DeleteQuizButton({ quizId, courseId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone and will delete all questions and student attempts.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/learn/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete quiz");
      }

      toast.success("Quiz deleted successfully");
      router.push(`/admin/learning/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete quiz");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-xl bg-danger-50 text-danger-600 hover:bg-danger-100 dark:bg-danger-900/20 dark:text-danger-400 dark:hover:bg-danger-900/40 transition-colors flex items-center justify-center disabled:opacity-50"
      title="Delete Quiz"
    >
      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
