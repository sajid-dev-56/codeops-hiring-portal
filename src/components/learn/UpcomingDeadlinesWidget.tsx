"use client";

import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";

type DeadlineTask = {
  id: string;
  title: string;
  dueDate: string;
  course: {
    title: string;
    slug: string;
  };
};

export default function UpcomingDeadlinesWidget({ tasks }: { tasks: DeadlineTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <p className="text-surface-900 dark:text-white font-medium">No Upcoming Deadlines</p>
        <p className="text-sm text-surface-500 mt-1">You&apos;re all caught up on your tasks!</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-danger-500/10 text-danger-500 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Upcoming Deadlines</h3>
          <p className="text-xs text-surface-500">Tasks due soon</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {tasks.map((task) => {
          const due = new Date(task.dueDate);
          let dueLabel = "";
          if (isToday(due)) dueLabel = "Today";
          else if (isTomorrow(due)) dueLabel = "Tomorrow";
          else dueLabel = formatDistanceToNow(due, { addSuffix: true });

          return (
            <Link
              key={task.id}
              href={`/learn/dashboard/courses/${task.course.slug}/tasks/${task.id}`}
              className="block p-3 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors group"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-surface-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {task.title}
                </h4>
                <span className="text-xs font-semibold text-danger-500 bg-danger-500/10 px-2 py-0.5 rounded-md whitespace-nowrap ml-2">
                  {dueLabel}
                </span>
              </div>
              <p className="text-xs text-surface-500 truncate">{task.course.title}</p>
            </Link>
          );
        })}
      </div>
      
      <div className="pt-4 mt-auto border-t border-surface-100 dark:border-surface-800">
        <div className="text-xs text-center text-surface-500">
          Showing next {tasks.length} deadline{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
