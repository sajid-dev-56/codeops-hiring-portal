import { prisma } from "@/lib/prisma";
import UpcomingDeadlinesWidget from "@/components/learn/UpcomingDeadlinesWidget";

export default async function DashboardDeadlines({ userId }: { userId: string }) {
  // Fetch upcoming deadlines
  const upcomingTasks = await prisma.task.findMany({
    where: {
      course: { enrollments: { some: { userId } } },
      dueDate: { gte: new Date() },
      submissions: { none: { userId } }, // Only fetch tasks that aren't submitted yet
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    select: {
      id: true,
      title: true,
      dueDate: true,
      course: { select: { title: true, slug: true } },
    },
  });

  return <UpcomingDeadlinesWidget tasks={JSON.parse(JSON.stringify(upcomingTasks))} />;
}
