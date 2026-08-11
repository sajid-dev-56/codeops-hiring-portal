import { prisma } from "@/lib/prisma";
import RecentAnnouncementsWidget from "@/components/learn/RecentAnnouncementsWidget";

export default async function DashboardAnnouncements({ userId }: { userId: string }) {
  // Fetch recent announcements
  const recentAnnouncements = await prisma.announcement.findMany({
    where: {
      course: { enrollments: { some: { userId } } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      course: { select: { title: true, slug: true } }
    }
  });

  return <RecentAnnouncementsWidget announcements={JSON.parse(JSON.stringify(recentAnnouncements))} />;
}
