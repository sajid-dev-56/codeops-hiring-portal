import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentApprovalClient from "./StudentApprovalClient";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    redirect("/login");
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      accountStatus: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Students</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage student accounts and approvals
          </p>
        </div>
      </div>

      <StudentApprovalClient initialStudents={students as any} />
    </div>
  );
}
