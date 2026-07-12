"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";

type InterviewData = {
  id: string;
  round: string;
  interviewer: string;
  interviewDate: string;
  score: number | null;
  decision: string | null;
  notes: string | null;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
};

const decisionConfig: Record<string, { label: string; class: string }> = {
  STRONG_YES: { label: "Strong Yes", class: "bg-green-50 text-green-700" },
  YES: { label: "Yes", class: "bg-green-50 text-green-600" },
  MAYBE: { label: "Maybe", class: "bg-amber-50 text-amber-600" },
  NO: { label: "No", class: "bg-red-50 text-red-600" },
  STRONG_NO: { label: "Strong No", class: "bg-red-50 text-red-700" },
};

export default function InterviewsClient({
  interviews,
}: {
  interviews: InterviewData[];
}) {
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [filterInterviewer, setFilterInterviewer] = useState("");
  const [filterDecision, setFilterDecision] = useState("");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const interviewers = useMemo(
    () => Array.from(new Set(interviews.map((i) => i.interviewer))),
    [interviews]
  );

  const filteredInterviews = useMemo(
    () =>
      interviews.filter((i) => {
        if (filterInterviewer && i.interviewer !== filterInterviewer)
          return false;
        if (filterDecision && i.decision !== filterDecision) return false;
        return true;
      }),
    [interviews, filterInterviewer, filterDecision]
  );

  const thisWeekInterviews = useMemo(
    () =>
      interviews.filter((i) =>
        isWithinInterval(parseISO(i.interviewDate), {
          start: weekStart,
          end: weekEnd,
        })
      ),
    [interviews, weekStart, weekEnd]
  );

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-surface-100 rounded-xl p-1 flex">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "calendar"
                ? "bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl text-surface-900 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "table"
                ? "bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl text-surface-900 dark:text-white shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            📋 Table
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800/50 bg-surface-50">
            <h3 className="font-semibold text-surface-900 dark:text-white">
              This Week — {format(weekStart, "MMM d")} to{" "}
              {format(weekEnd, "MMM d, yyyy")}
            </h3>
          </div>
          <div className="grid grid-cols-7 divide-x divide-surface-100">
            {weekDays.map((day) => {
              const dayInterviews = thisWeekInterviews.filter((i) =>
                isSameDay(parseISO(i.interviewDate), day)
              );
              const isToday = isSameDay(day, today);

              return (
                <div key={day.toISOString()} className="min-h-[200px]">
                  <div
                    className={`px-3 py-2 text-center border-b border-surface-100 dark:border-surface-800/50 ${
                      isToday ? "bg-primary-50" : "bg-surface-50"
                    }`}
                  >
                    <p className="text-xs text-surface-500 uppercase">
                      {format(day, "EEE")}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        isToday ? "text-primary-600" : "text-surface-900 dark:text-white"
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                  <div className="p-2 space-y-1.5">
                    {dayInterviews.map((interview) => (
                      <Link
                        key={interview.id}
                        href={`/admin/candidates/${interview.candidateId}`}
                        className="block p-2 rounded-lg bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors"
                      >
                        <p className="text-xs font-medium text-primary-800 truncate">
                          {interview.candidateName}
                        </p>
                        <p className="text-xs text-primary-600 truncate">
                          {interview.round}
                        </p>
                        <p className="text-xs text-primary-500 mt-0.5">
                          {format(
                            parseISO(interview.interviewDate),
                            "h:mm a"
                          )}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filterInterviewer}
              onChange={(e) => setFilterInterviewer(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 outline-none focus:border-primary-400"
            >
              <option value="">All Interviewers</option>
              {interviewers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 outline-none focus:border-primary-400"
            >
              <option value="">All Decisions</option>
              <option value="STRONG_YES">Strong Yes</option>
              <option value="YES">Yes</option>
              <option value="MAYBE">Maybe</option>
              <option value="NO">No</option>
              <option value="STRONG_NO">Strong No</option>
            </select>
          </div>

          <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800/50 bg-surface-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Round
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Interviewer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">
                      Decision
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredInterviews.map((interview) => (
                    <tr
                      key={interview.id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/candidates/${interview.candidateId}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {interview.candidateName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {interview.jobTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {interview.round}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {interview.interviewer}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {format(
                          parseISO(interview.interviewDate),
                          "MMM d, yyyy h:mm a"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {interview.score ? `${interview.score}/10` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {interview.decision &&
                        decisionConfig[interview.decision] ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              decisionConfig[interview.decision].class
                            }`}
                          >
                            {decisionConfig[interview.decision].label}
                          </span>
                        ) : (
                          <span className="text-xs text-surface-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredInterviews.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-surface-400"
                      >
                        No interviews found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
