import { Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnnouncementCardProps {
  title: string;
  content: string;
  createdAt: Date | string;
  courseName?: string;
}

export default function AnnouncementCard({ title, content, createdAt, courseName }: AnnouncementCardProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5 hover:border-primary-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
          <Megaphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-surface-900 dark:text-white truncate">{title}</h4>
            <span className="text-xs text-surface-400 dark:text-surface-500 flex-shrink-0">{timeAgo}</span>
          </div>
          {courseName && (
            <p className="text-xs text-primary-500 font-medium mb-1">{courseName}</p>
          )}
          <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-line">{content}</p>
        </div>
      </div>
    </div>
  );
}
