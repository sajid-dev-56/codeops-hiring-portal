"use client";

import { useState } from "react";
import { runAiScreening } from "../actions";

export default function RunAiScreeningButton({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      await runAiScreening(candidateId);
    } catch (error) {
      console.error("Failed to run AI screening:", error);
      alert("AI Screening failed. Ensure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-surface-100">
      <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
        <span className="text-brand-600">✨</span> AI Screening Analysis
      </h3>
      <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 border-dashed rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-50 flex items-center justify-center">
          <span className="text-xl">✨</span>
        </div>
        <h4 className="font-medium text-surface-900 dark:text-white mb-1">AI Screening Pending</h4>
        <p className="text-sm text-surface-500 mb-4">
          Generate an AI-powered summary and match score for this candidate.
        </p>
        <button
          onClick={handleRun}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            "Run AI Screening"
          )}
        </button>
      </div>
    </div>
  );
}
