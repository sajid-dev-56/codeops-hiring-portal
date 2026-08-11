"use client";

import { useState } from "react";
import { Search, CheckCircle2, ChevronDown, ChevronUp, History, Trophy, Clock } from "lucide-react";

type Attempt = {
  id: string;
  score: number | null;
  strikes: number;
  status: string;
  completedAt: Date | null;
};

type UserData = {
  id: string;
  name: string | null;
  email: string;
};

type GroupedAttempt = {
  user: UserData;
  attempts: Attempt[];
  bestScore: number;
  latestScore: number | null;
  totalAttempts: number;
};

export default function QuizAttemptsClient({ attempts }: { attempts: any[] }) {
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Group attempts by user
  const groupedData: Record<string, GroupedAttempt> = {};

  attempts.forEach((attempt) => {
    const userId = attempt.userId;
    if (!groupedData[userId]) {
      groupedData[userId] = {
        user: attempt.user,
        attempts: [],
        bestScore: -1,
        latestScore: null,
        totalAttempts: 0,
      };
    }

    groupedData[userId].attempts.push({
      id: attempt.id,
      score: attempt.score,
      strikes: attempt.strikes,
      status: attempt.status,
      completedAt: attempt.completedAt ? new Date(attempt.completedAt) : null,
    });
    
    groupedData[userId].totalAttempts += 1;

    if (attempt.score !== null && attempt.score > groupedData[userId].bestScore) {
      groupedData[userId].bestScore = attempt.score;
    }
  });

  // Calculate latest score based on the first item (since it's ordered by completedAt desc)
  const groupedArray = Object.values(groupedData).map((group) => {
    if (group.attempts.length > 0) {
      group.latestScore = group.attempts[0].score;
    }
    return group;
  });

  // Sort by best score descending
  groupedArray.sort((a, b) => b.bestScore - a.bestScore);

  if (groupedArray.length === 0) {
    return (
      <div className="p-12 text-center text-surface-500 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
        No submissions found for this quiz yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedArray.map((group) => {
        const isExpanded = expandedUsers[group.user.id];

        return (
          <div key={group.user.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header / Summary Row */}
            <div 
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
              onClick={() => toggleUser(group.user.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-lg border border-primary-200 dark:border-primary-800">
                  {group.user.name ? group.user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white text-lg">
                    {group.user.name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-surface-500">{group.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-wrap">
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Best Score
                  </span>
                  <span className={`text-lg font-black ${
                    group.bestScore >= 50 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {group.bestScore !== -1 ? `${group.bestScore}%` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col items-center md:items-end">
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Latest Score
                  </span>
                  <span className={`text-lg font-bold ${
                    group.latestScore !== null && group.latestScore >= 50 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {group.latestScore !== null ? `${group.latestScore}%` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col items-center md:items-end">
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1">
                    Attempts
                  </span>
                  <span className="text-lg font-bold text-surface-700 dark:text-surface-300">
                    {group.totalAttempts}
                  </span>
                </div>

                <div className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Expandable History Section */}
            {isExpanded && (
              <div className="border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 p-5">
                <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-surface-500" /> Attempt History
                </h4>
                <div className="space-y-3">
                  {group.attempts.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xs font-medium text-surface-600 dark:text-surface-400">
                          {group.attempts.length - index}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {attempt.completedAt ? attempt.completedAt.toLocaleString() : 'In Progress'}
                          </span>
                          <span className="text-xs text-surface-500">
                            {attempt.status === "GRADED" ? (
                              <span className="text-success-600 dark:text-success-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Graded
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 mt-0.5">
                                <Search className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-0.5">Strikes</p>
                          <p className={`text-sm font-semibold ${attempt.strikes > 0 ? 'text-danger-500' : 'text-surface-700 dark:text-surface-300'}`}>
                            {attempt.strikes}
                          </p>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-0.5">Score</p>
                          <p className={`text-sm font-bold ${
                            attempt.score !== null && attempt.score >= 50 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                          }`}>
                            {attempt.score !== null ? `${attempt.score}%` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
