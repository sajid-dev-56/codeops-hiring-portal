"use client";

import { useState } from "react";
import { addNote, createInterview } from "../actions";

type NoteData = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
};

type InterviewData = {
  id: string;
  round: string;
  interviewer: string;
  interviewDate: string;
  score: number | null;
  decision: string | null;
  notes: string | null;
};

const decisionLabels: Record<string, { label: string; class: string }> = {
  STRONG_YES: { label: "Strong Yes", class: "text-green-600 bg-green-50" },
  YES: { label: "Yes", class: "text-green-500 bg-green-50" },
  MAYBE: { label: "Maybe", class: "text-amber-600 bg-amber-50" },
  NO: { label: "No", class: "text-red-500 bg-red-50" },
  STRONG_NO: { label: "Strong No", class: "text-red-600 bg-red-50" },
};

export default function CandidateDetailClient({
  candidateId,
  cvFileKey,
  serializedNotes,
  serializedInterviews,
}: {
  candidateId: string;
  cvFileKey: string | null;
  serializedNotes: NoteData[];
  serializedInterviews: InterviewData[];
}) {
  const [downloading, setDownloading] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    round: "",
    interviewer: "",
    interviewDate: "",
    score: "",
    decision: "",
    notes: "",
  });
  const [savingInterview, setSavingInterview] = useState(false);

  const handleDownloadCV = async (download: boolean = false) => {
    if (!cvFileKey) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/upload/download?key=${encodeURIComponent(cvFileKey)}&download=${download}`);
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      await addNote(candidateId, noteContent);
      setNoteContent("");
    } catch (err) {
      console.error("Failed to add note:", err);
    }
    setAddingNote(false);
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInterview(true);
    try {
      await createInterview({
        candidateId,
        round: interviewForm.round,
        interviewer: interviewForm.interviewer,
        interviewDate: interviewForm.interviewDate,
        score: interviewForm.score ? parseInt(interviewForm.score) : null,
        decision: interviewForm.decision || null,
        notes: interviewForm.notes,
      });
      setInterviewForm({
        round: "",
        interviewer: "",
        interviewDate: "",
        score: "",
        decision: "",
        notes: "",
      });
      setShowInterviewForm(false);
    } catch (err) {
      console.error("Failed to create interview:", err);
    }
    setSavingInterview(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* CV Section */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-900 mb-1">Resume / CV</h2>
          <p className="text-sm text-surface-500">
            {cvFileKey ? "Download the candidate's resume" : "No resume uploaded"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadCV(false)}
            disabled={downloading || !cvFileKey}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 text-surface-700 font-medium text-sm hover:bg-surface-100 border border-surface-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Live Preview
          </button>
          <button
            onClick={() => handleDownloadCV(true)}
            disabled={downloading || !cvFileKey}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-medium text-sm hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CV
          </button>
        </div>
      </div>

      {/* Interviews Section */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">
            Interviews ({serializedInterviews.length})
          </h2>
          <button
            onClick={() => setShowInterviewForm(!showInterviewForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Interview
          </button>
        </div>

        {/* Add Interview Form */}
        {showInterviewForm && (
          <form
            onSubmit={handleCreateInterview}
            className="mb-6 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Round *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.round}
                  onChange={(e) =>
                    setInterviewForm({ ...interviewForm, round: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 text-surface-900"
                  placeholder="Technical Round 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Interviewer *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.interviewer}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      interviewer: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 text-surface-900"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.interviewDate}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      interviewDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 text-surface-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Score (1-10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={interviewForm.score}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      score: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 text-surface-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Decision
                </label>
                <select
                  value={interviewForm.decision}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      decision: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 text-surface-900"
                >
                  <option value="">Pending</option>
                  <option value="STRONG_YES">Strong Yes</option>
                  <option value="YES">Yes</option>
                  <option value="MAYBE">Maybe</option>
                  <option value="NO">No</option>
                  <option value="STRONG_NO">Strong No</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={interviewForm.notes}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-400 resize-none text-surface-900"
                  placeholder="Interview feedback..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInterviewForm(false)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm text-surface-600 hover:bg-surface-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingInterview}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
              >
                {savingInterview ? "Saving..." : "Save Interview"}
              </button>
            </div>
          </form>
        )}

        {/* Interview List */}
        <div className="space-y-3">
          {serializedInterviews.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-6">
              No interviews scheduled yet
            </p>
          )}
          {serializedInterviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm text-surface-900">
                    {interview.round}
                  </p>
                  {interview.decision &&
                    decisionLabels[interview.decision] && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          decisionLabels[interview.decision].class
                        }`}
                      >
                        {decisionLabels[interview.decision].label}
                      </span>
                    )}
                  {interview.score && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-600">
                      Score: {interview.score}/10
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500">
                  {interview.interviewer} •{" "}
                  {new Date(interview.interviewDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                </p>
                {interview.notes && (
                  <p className="text-sm text-surface-600 mt-2 whitespace-pre-wrap">
                    {interview.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          Notes ({serializedNotes.length})
        </h2>

        {/* Add Note */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm outline-none focus:border-primary-400 text-surface-900 placeholder:text-surface-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <button
            onClick={handleAddNote}
            disabled={addingNote || !noteContent.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {addingNote ? "..." : "Add"}
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {serializedNotes.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-4">
              No notes yet
            </p>
          )}
          {serializedNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-xl bg-surface-50 border border-surface-100"
            >
              <p className="text-sm text-surface-700">{note.content}</p>
              <p className="text-xs text-surface-400 mt-2">
                {note.author} •{" "}
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
