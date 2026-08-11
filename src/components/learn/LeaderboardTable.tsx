import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalMarks: number;
  tasksCompleted: number;
  coursesEnrolled: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showCourses?: boolean;
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-surface-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-surface-400">#{rank}</span>;
}

function getRankStyle(rank: number): string {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 dark:from-yellow-500/10 dark:to-yellow-600/5 dark:border-yellow-500/20";
  if (rank === 2) return "bg-gradient-to-r from-surface-300/10 to-surface-400/5 border-surface-300/30 dark:from-surface-400/10 dark:to-surface-500/5 dark:border-surface-500/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/30 dark:from-amber-700/10 dark:to-amber-800/5 dark:border-amber-700/20";
  return "bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800";
}

export default function LeaderboardTable({
  entries,
  currentUserId,
  showCourses = true,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700">
        <Trophy className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No Rankings Yet</h3>
        <p className="text-surface-500 dark:text-surface-400">Complete tasks to appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${getRankStyle(entry.rank)} ${
              isCurrentUser ? "ring-2 ring-primary-500/50 shadow-md shadow-primary-500/10" : "hover:shadow-sm"
            }`}
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              {getRankBadge(entry.rank)}
            </div>

            {/* Name & Avatar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-900 dark:text-white truncate">
                  {entry.name || "Anonymous Student"}
                </span>
                {isCurrentUser && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                <span>{entry.tasksCompleted} Tasks</span>
                {showCourses && <span>• {entry.coursesEnrolled} Courses</span>}
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <div className="text-xl font-bold text-surface-900 dark:text-white">
                {entry.totalMarks}%
              </div>
              <div className="text-xs text-surface-500 dark:text-surface-400">overall score</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
