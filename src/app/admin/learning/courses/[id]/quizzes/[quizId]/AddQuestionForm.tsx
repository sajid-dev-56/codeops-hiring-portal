"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Sparkles, Upload, FileText, CheckCircle2 } from "lucide-react";

type QuestionPayload = {
  text: string;
  options: string[];
  correctOption: number;
};

export default function AddQuestionForm({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"MANUAL" | "AI_SETUP" | "AI_PREVIEW">("MANUAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Form State
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);

  // AI Setup State
  const [aiCount, setAiCount] = useState(12);
  const [aiText, setAiText] = useState("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreviewData, setAiPreviewData] = useState<QuestionPayload[]>([]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handlePreviewOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newData = [...aiPreviewData];
    newData[qIndex].options[optIndex] = value;
    setAiPreviewData(newData);
  };

  const handlePreviewTextChange = (qIndex: number, value: string) => {
    const newData = [...aiPreviewData];
    newData[qIndex].text = value;
    setAiPreviewData(newData);
  };

  const handlePreviewCorrectOptionChange = (qIndex: number, value: number) => {
    const newData = [...aiPreviewData];
    newData[qIndex].correctOption = value;
    setAiPreviewData(newData);
  };

  const resetForm = () => {
    setIsOpen(false);
    setMode("MANUAL");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setAiText("");
    setAiFile(null);
    setAiPreviewData([]);
    setError(null);
  };

  // Submit Single Manual Question
  async function onSubmitManual(e: React.FormEvent<HTMLFormElement>) {
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

    try {
      const res = await fetch(`/api/learn/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, options, correctOption }),
      });

      if (!res.ok) throw new Error("Failed to create question");

      resetForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate Questions via AI
  async function onGenerateAI(e: React.FormEvent) {
    e.preventDefault();
    if (!aiText.trim() && !aiFile) {
      setError("Please provide a topic/text or upload a PDF.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      let content = aiText;
      let inputType = "text";

      if (aiFile) {
        // Convert file to base64
        inputType = "pdf";
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(aiFile);
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = (error) => reject(error);
        });
      }

      const res = await fetch(`/api/learn/quizzes/${quizId}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputType, content, numQuestions: aiCount }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to generate questions");
      }

      const data = await res.json();
      setAiPreviewData(data.questions);
      setMode("AI_PREVIEW");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Save Bulk Preview Questions
  async function onSaveBulk() {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/learn/quizzes/${quizId}/bulk-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: aiPreviewData }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save questions");
      }

      resetForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => { setIsOpen(true); setMode("MANUAL"); }}
          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-700 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Manually
        </button>
        <button
          onClick={() => { setIsOpen(true); setMode("AI_SETUP"); }}
          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700/50 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" /> Generate with AI
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">
            {mode === "MANUAL" && "New Manual Question"}
            {mode === "AI_SETUP" && "Generate Questions via AI"}
            {mode === "AI_PREVIEW" && "Preview & Edit Generated Questions"}
          </h3>
          {mode === "AI_PREVIEW" && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-semibold rounded-lg">
              {aiPreviewData.length} Generated
            </span>
          )}
        </div>
        <button onClick={resetForm} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {mode === "AI_SETUP" && (
        <form onSubmit={onGenerateAI} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={aiCount}
                onChange={(e) => setAiCount(parseInt(e.target.value) || 12)}
                className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Upload PDF (Optional)</label>
              <label className="flex items-center justify-center w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <Upload className="w-4 h-4" />
                  {aiFile ? aiFile.name : "Choose a PDF file"}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Or Provide Topic / Bulk Text</label>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Paste HTML, unstructured text, or just type 'Generate 12 questions about Next.js Server Components...'"
            />
          </div>

          {error && <p className="text-sm text-danger-500 bg-danger-50 dark:bg-danger-500/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Questions
            </button>
          </div>
        </form>
      )}

      {mode === "AI_PREVIEW" && (
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {aiPreviewData.map((q, qIndex) => (
            <div key={qIndex} className="p-4 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl space-y-4">
              <div className="flex gap-3">
                <span className="font-bold text-primary-500">{qIndex + 1}.</span>
                <textarea
                  value={q.text}
                  onChange={(e) => handlePreviewTextChange(qIndex, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  rows={2}
                />
              </div>
              <div className="pl-6 space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctOption === optIndex}
                      onChange={() => handlePreviewCorrectOptionChange(qIndex, optIndex)}
                      className="w-4 h-4 text-primary-600 border-surface-300 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePreviewOptionChange(qIndex, optIndex, e.target.value)}
                      className={`flex-1 px-3 py-1.5 bg-white dark:bg-surface-900 border rounded-lg text-sm outline-none transition-colors ${q.correctOption === optIndex ? 'border-primary-500 ring-1 ring-primary-500' : 'border-surface-200 dark:border-surface-700'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-danger-500 bg-danger-50 dark:bg-danger-500/10 p-3 rounded-lg">{error}</p>}

          <div className="sticky bottom-0 bg-white dark:bg-surface-900 pt-4 pb-2 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setMode("AI_SETUP")} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-xl">Back</button>
            <button onClick={onSaveBulk} disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-success-600 hover:bg-success-700 rounded-xl disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save All {aiPreviewData.length} Questions
            </button>
          </div>
        </div>
      )}

      {mode === "MANUAL" && (
        <form onSubmit={onSubmitManual} className="space-y-6">
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
                  name="correctOptionManual"
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
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Question
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
