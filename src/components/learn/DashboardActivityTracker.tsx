"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function DashboardActivityTracker() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    // Record activity and get streak
    fetch("/api/user/activity", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.currentStreak !== undefined) {
          setStreak(data.currentStreak);
        }
      })
      .catch(console.error);
  }, []);

  if (streak === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
      <Flame className="w-4 h-4" />
      <span className="text-sm font-bold">{streak} Day Streak</span>
    </div>
  );
}
