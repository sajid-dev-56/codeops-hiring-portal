"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Clock, Users, Play, Square, Calendar } from "lucide-react";

type QuizWithDetails = {
  id: string;
  title: string;
  status: string;
  timeLimit: number;
  startTime: Date | null;
  endTime: Date | null;
  course: { id: string; title: string };
  _count: { questions: number; attempts: number };
};

export default function QuizzesClient({ initialQuizzes }: { initialQuizzes: QuizWithDetails[] }) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/learn/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );
      toast.success("Quiz status updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quiz status");
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Quiz Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Course</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Time</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Questions</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Attempts</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Status Control</th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-surface-900 dark:text-white">{quiz.title}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    {quiz.course.title}
                  </span>
                </td>
                <td className="px-5 py-4 text-center text-sm text-surface-600 dark:text-surface-400">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.timeLimit / 60}m
                  </div>
                </td>
                <td className="px-5 py-4 text-center text-sm text-surface-600 dark:text-surface-400">
                  {quiz._count.questions}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                    <Users className="w-3.5 h-3.5" />
                    {quiz._count.attempts}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="inline-flex items-center p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
                    <button
                      onClick={() => handleStatusChange(quiz.id, "SCHEDULED")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        quiz.status === "SCHEDULED" ? "bg-white dark:bg-surface-600 text-surface-900 dark:text-white shadow-sm" : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                      }`}
                      title="Follow Schedule"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(quiz.id, "OPEN")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        quiz.status === "OPEN" ? "bg-success-500 text-white shadow-sm" : "text-surface-500 hover:text-success-600"
                      }`}
                      title="Force Open"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(quiz.id, "CLOSED")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        quiz.status === "CLOSED" ? "bg-red-500 text-white shadow-sm" : "text-surface-500 hover:text-red-600"
                      }`}
                      title="Force Close"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/learning/courses/${quiz.course.id}/quizzes/${quiz.id}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
