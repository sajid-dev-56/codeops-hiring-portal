"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Target } from "lucide-react";

type Goal = {
  id: string;
  text: string;
  completed: boolean;
};

export default function DailyGoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learn/goals")
      .then((res) => res.json())
      .then((data) => {
        if (data.goals) setGoals(data.goals);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const res = await fetch("/api/learn/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newGoal.trim() }),
    });

    if (res.ok) {
      const { goal } = await res.json();
      setGoals([...goals, goal]);
      setNewGoal("");
    }
  };

  const handleToggleGoal = async (id: string, completed: boolean) => {
    // Optimistic update
    setGoals(goals.map((g) => (g.id === id ? { ...g, completed } : g)));

    await fetch("/api/learn/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
  };

  if (loading) {
    return <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 animate-pulse h-48"></div>;
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-white">Daily Goals</h3>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-48">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-3 group">
            <button
              onClick={() => handleToggleGoal(goal.id, !goal.completed)}
              className="text-surface-400 hover:text-primary-500 transition-colors"
            >
              {goal.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <span className={`text-sm ${goal.completed ? "text-surface-400 line-through" : "text-surface-700 dark:text-surface-300"}`}>
              {goal.text}
            </span>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-sm text-surface-500 dark:text-surface-400 italic">No goals set for today.</p>
        )}
      </div>

      <form onSubmit={handleAddGoal} className="mt-auto flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          className="flex-1 px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all dark:text-white"
        />
        <button
          type="submit"
          disabled={!newGoal.trim()}
          className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
