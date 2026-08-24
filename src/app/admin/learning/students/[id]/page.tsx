import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/app/admin/learning/students/[id]/StudentProfileClient";

export const dynamic = "force-dynamic";

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
      lastActivityDate: true,
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

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: id },
    include: {
      course: {
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
      reactivationRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const latestLessonCompletion = await prisma.lessonCompletion.findFirst({
    where: { userId: id },
    orderBy: { completedAt: "desc" },
    include: {
      lesson: {
        include: { course: true },
      },
    },
  });

  const latestQuizAttempt = await prisma.quizAttempt.findFirst({
    where: { userId: id },
    orderBy: { startedAt: "desc" },
    include: {
      quiz: {
        include: { course: true },
      },
    },
  });

  // Multi-signal activity computation
  const dates: Date[] = [student.createdAt];
  if (student.lastActivityDate) dates.push(student.lastActivityDate);
  if (submissions[0]?.submittedAt) dates.push(submissions[0].submittedAt);
  if (latestLessonCompletion?.completedAt) dates.push(latestLessonCompletion.completedAt);
  if (latestQuizAttempt?.completedAt) dates.push(latestQuizAttempt.completedAt);
  else if (latestQuizAttempt?.startedAt) dates.push(latestQuizAttempt.startedAt);

  enrollments.forEach((e) => {
    dates.push(e.enrolledAt);
    if (e.reactivatedAt) dates.push(e.reactivatedAt);
  });

  const latestActivityDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const inactiveDays = Math.max(
    0,
    Math.floor((Date.now() - latestActivityDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const studentWithActivity = {
    ...student,
    inactiveDays,
    latestActivityDate: latestActivityDate.toISOString(),
    lastLesson: latestLessonCompletion
      ? {
          title: latestLessonCompletion.lesson.title,
          courseTitle: latestLessonCompletion.lesson.course.title,
          completedAt: latestLessonCompletion.completedAt.toISOString(),
        }
      : null,
    lastQuiz: latestQuizAttempt
      ? {
          title: latestQuizAttempt.quiz.title,
          courseTitle: latestQuizAttempt.quiz.course.title,
          score: latestQuizAttempt.score,
          date: (latestQuizAttempt.completedAt || latestQuizAttempt.startedAt).toISOString(),
        }
      : null,
  };

  return (
    <div className="space-y-6">
      <StudentProfileClient
        student={studentWithActivity as any}
        submissions={submissions as any}
        enrollments={enrollments as any}
      />
    </div>
  );
}
