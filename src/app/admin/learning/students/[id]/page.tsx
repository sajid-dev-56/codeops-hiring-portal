import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/app/admin/learning/students/[id]/StudentProfileClient";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    redirect("/login");
  }

  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      accountStatus: true,
      createdAt: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  if (!student) {
    redirect("/admin/learning/students");
  }

  const submissions = await prisma.taskSubmission.findMany({
    where: { userId: id },
    include: {
      task: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <StudentProfileClient student={student as any} submissions={submissions as any} />
    </div>
  );
}
