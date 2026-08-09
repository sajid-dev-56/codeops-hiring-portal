"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

export default function AddQuestionForm({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default 4 options
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;

    if (options.some((opt) => !opt.trim())) {
      setError("All options must be filled.");
      setIsSubmitting(false);
      return;
    }

    const data = {
      text,
      options,
      correctOption,
    };

    try {
      const res = await fetch(`/api/learn/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create question");

      setIsOpen(false);
      setOptions(["", "", "", ""]);
      setCorrectOption(0);
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
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-700 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Add Question
      </button>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-surface-900 dark:text-white">New Question</h3>
        <button onClick={() => setIsOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Question Text</label>
          <textarea
            name="text"
            required
            rows={3}
            className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="e.g. What is the output of typeof null in JavaScript?"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === index}
                onChange={() => setCorrectOption(index)}
                className="w-4 h-4 text-primary-600 border-surface-300 focus:ring-primary-500"
              />
              <input
                type="text"
                required
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={`flex-1 px-4 py-2 bg-surface-50 dark:bg-surface-800 border rounded-lg text-sm outline-none transition-colors ${correctOption === index ? 'border-primary-500 ring-1 ring-primary-500' : 'border-surface-200 dark:border-surface-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}`}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
          <p className="text-xs text-surface-500 mt-2">Select the radio button next to the correct option.</p>
        </div>

        {error && <p className="text-sm text-danger-500 bg-danger-50 dark:bg-danger-500/10 p-3 rounded-lg">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Question
          </button>
        </div>
      </form>
    </div>
  );
}
