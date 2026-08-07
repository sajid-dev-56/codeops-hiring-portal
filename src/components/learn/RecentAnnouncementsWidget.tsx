import { Megaphone, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnnouncementCard from "./AnnouncementCard";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  course: {
    title: string;
    slug: string;
  };
}

interface RecentAnnouncementsWidgetProps {
  announcements: Announcement[];
}

export default function RecentAnnouncementsWidget({ announcements }: RecentAnnouncementsWidgetProps) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
            <Megaphone className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Recent Announcements</h2>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
          <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4 text-surface-300 dark:text-surface-600">
            <Megaphone className="w-8 h-8" />
          </div>
          <p className="text-surface-500 font-medium">No recent announcements</p>
          <p className="text-sm text-surface-400 mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {announcements.map((ann) => (
            <Link key={ann.id} href={`/learn/dashboard/courses/${ann.course.slug}`} className="block">
              <AnnouncementCard
                title={ann.title}
                content={ann.content}
                createdAt={ann.createdAt}
                courseName={ann.course.title}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
