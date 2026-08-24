import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentApprovalClient from "./StudentApprovalClient";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    redirect("/login");
  }

  const rawStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
          reactivationRequests: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      lessonCompletions: {
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { completedAt: true },
      },
      taskSubmissions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { submittedAt: true },
      },
      quizAttempts: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { startedAt: true, completedAt: true },
      },
      reactivationRequests: {
        include: {
          enrollment: {
            include: {
              course: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const now = new Date();

  const students = rawStudents.map((s) => {
    const dates: Date[] = [s.createdAt];
    if (s.lastActivityDate) dates.push(s.lastActivityDate);
    if (s.lessonCompletions[0]?.completedAt) dates.push(s.lessonCompletions[0].completedAt);
    if (s.taskSubmissions[0]?.submittedAt) dates.push(s.taskSubmissions[0].submittedAt);
    if (s.quizAttempts[0]?.completedAt) dates.push(s.quizAttempts[0].completedAt);
    else if (s.quizAttempts[0]?.startedAt) dates.push(s.quizAttempts[0].startedAt);

    s.enrollments.forEach((e) => {
      dates.push(e.enrolledAt);
      if (e.reactivatedAt) dates.push(e.reactivatedAt);
    });

    const latestActivityDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const inactiveDays = Math.max(
      0,
      Math.floor((now.getTime() - latestActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const hasDroppedEnrollment = s.enrollments.some((e) => e.status === "DROPPED");
    const hasActiveEnrollment = s.enrollments.some((e) => e.status === "ACTIVE");
    const pendingRequests = s.reactivationRequests.filter((r) => r.status === "PENDING");

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      accountStatus: s.accountStatus,
      createdAt: s.createdAt.toISOString(),
      currentStreak: s.currentStreak,
      lastActivityDate: s.lastActivityDate ? s.lastActivityDate.toISOString() : null,
      latestActivityDate: latestActivityDate.toISOString(),
      inactiveDays,
      hasDroppedEnrollment,
      hasActiveEnrollment,
      enrollments: s.enrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.course.title,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        droppedAt: e.droppedAt ? e.droppedAt.toISOString() : null,
        dropReason: e.dropReason,
        reactivatedAt: e.reactivatedAt ? e.reactivatedAt.toISOString() : null,
      })),
      pendingRequestsCount: pendingRequests.length,
      reactivationRequests: s.reactivationRequests.map((r) => ({
        id: r.id,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        courseTitle: r.enrollment?.course?.title || "Enrolled Course",
        enrollmentId: r.enrollmentId,
        adminNote: r.adminNote,
      })),
    };
  });

  // Collect all reactivation requests for dedicated tab
  const allReactivationRequests = rawStudents.flatMap((s) =>
    s.reactivationRequests.map((r) => ({
      id: r.id,
      userId: s.id,
      studentName: s.name || "Unnamed Student",
      studentEmail: s.email,
      enrollmentId: r.enrollmentId,
      courseTitle: r.enrollment?.course?.title || "Enrolled Course",
      reason: r.reason,
      status: r.status,
      adminNote: r.adminNote,
      createdAt: r.createdAt.toISOString(),
    }))
  );

  return (
    <div className="space-y-6">
      <StudentApprovalClient
        initialStudents={students as any}
        initialRequests={allReactivationRequests as any}
      />
    </div>
  );
}
