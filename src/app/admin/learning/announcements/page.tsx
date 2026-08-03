import { prisma } from "@/lib/prisma";
import AnnouncementCard from "@/components/learn/AnnouncementCard";
import PostAnnouncementForm from "./PostAnnouncementForm";
import { Megaphone } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const announcements = await prisma.announcement.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Announcements</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Post updates and notices to your students</p>
      </div>

      {/* Post Form */}
      <PostAnnouncementForm courses={courses} />

      {/* Existing Announcements */}
      {announcements.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Recent Announcements</h2>
          {announcements.map((ann) => (
            <div key={ann.id}>
              <p className="text-xs text-surface-400 mb-1">{ann.course.title}</p>
              <AnnouncementCard
                title={ann.title}
                content={ann.content}
                createdAt={ann.createdAt}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <Megaphone className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Announcements</h3>
          <p className="text-surface-500 dark:text-surface-400">Post your first announcement above.</p>
        </div>
      )}
    </div>
  );
}


export const dynamic = "force-dynamic";
