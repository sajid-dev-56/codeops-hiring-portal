import { prisma } from "@/lib/prisma";
import { sendCourseDroppedEmail, sendCourseReactivatedEmail } from "@/lib/email";

export interface StudentActivityDetails {
  userId: string;
  courseId: string;
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseSlug: string;
  enrollmentStatus: "ACTIVE" | "DROPPED" | "COMPLETED";
  enrolledAt: Date;
  droppedAt: Date | null;
  dropReason: string | null;
  reactivatedAt: Date | null;
  lastLoginDate: Date | null;
  lastLessonDate: Date | null;
  lastTaskDate: Date | null;
  lastQuizDate: Date | null;
  latestActivityDate: Date;
  inactiveDays: number;
  activityStatus: "ACTIVE" | "WARNING" | "DROPPED" | "INACTIVE_CRITICAL";
  hasPendingReactivation: boolean;
}

/**
 * Calculates multi-signal engagement timestamp for a student in a course
 */
export async function getStudentActivitySummary(
  userId: string,
  courseId: string
): Promise<StudentActivityDetails | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          lastActivityDate: true,
          createdAt: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      reactivationRequests: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!enrollment) return null;

  // 1. Latest lesson completion in this course
  const latestLessonCompletion = await prisma.lessonCompletion.findFirst({
    where: {
      userId,
      lesson: { courseId },
    },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  // 2. Latest task submission in this course
  const latestTaskSubmission = await prisma.taskSubmission.findFirst({
    where: {
      userId,
      task: { courseId },
    },
    orderBy: { submittedAt: "desc" },
    select: { submittedAt: true },
  });

  // 3. Latest quiz attempt in this course
  const latestQuizAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId,
      quiz: { courseId },
    },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true, completedAt: true },
  });

  const dates: Date[] = [
    enrollment.enrolledAt, // Never drop before 7 days from enrollment
  ];

  if (enrollment.user.lastActivityDate) dates.push(enrollment.user.lastActivityDate);
  if (latestLessonCompletion?.completedAt) dates.push(latestLessonCompletion.completedAt);
  if (latestTaskSubmission?.submittedAt) dates.push(latestTaskSubmission.submittedAt);
  if (latestQuizAttempt?.completedAt) dates.push(latestQuizAttempt.completedAt);
  else if (latestQuizAttempt?.startedAt) dates.push(latestQuizAttempt.startedAt);

  // If reactivated, also consider reactivatedAt
  if (enrollment.reactivatedAt) dates.push(enrollment.reactivatedAt);

  // Find latest timestamp among all signals
  const latestActivityDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const now = new Date();
  const diffMs = now.getTime() - latestActivityDate.getTime();
  const inactiveDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  let activityStatus: "ACTIVE" | "WARNING" | "DROPPED" | "INACTIVE_CRITICAL" = "ACTIVE";
  if (enrollment.status === "DROPPED") {
    activityStatus = "DROPPED";
  } else if (inactiveDays >= 7) {
    activityStatus = "INACTIVE_CRITICAL";
  } else if (inactiveDays >= 5) {
    activityStatus = "WARNING";
  }

  return {
    userId,
    courseId,
    enrollmentId: enrollment.id,
    studentName: enrollment.user.name || "Student",
    studentEmail: enrollment.user.email,
    courseTitle: enrollment.course.title,
    courseSlug: enrollment.course.slug,
    enrollmentStatus: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    droppedAt: enrollment.droppedAt,
    dropReason: enrollment.dropReason,
    reactivatedAt: enrollment.reactivatedAt,
    lastLoginDate: enrollment.user.lastActivityDate,
    lastLessonDate: latestLessonCompletion?.completedAt || null,
    lastTaskDate: latestTaskSubmission?.submittedAt || null,
    lastQuizDate: latestQuizAttempt?.completedAt || latestQuizAttempt?.startedAt || null,
    latestActivityDate,
    inactiveDays,
    activityStatus,
    hasPendingReactivation: enrollment.reactivationRequests.length > 0,
  };
}

/**
 * Drop student from course enrollment
 */
export async function dropStudentEnrollment({
  enrollmentId,
  reason,
  isAutomated = false,
  notifyStudent = true,
}: {
  enrollmentId: string;
  reason: string;
  isAutomated?: boolean;
  notifyStudent?: boolean;
}) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: true,
      course: true,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "DROPPED",
      droppedAt: new Date(),
      dropReason: reason,
    },
  });

  if (notifyStudent && enrollment.user.email) {
    try {
      await sendCourseDroppedEmail({
        studentName: enrollment.user.name || "Student",
        studentEmail: enrollment.user.email,
        courseTitle: enrollment.course.title,
        dropReason: reason,
      });
    } catch (err) {
      console.error("Failed to send course dropped email:", err);
    }
  }

  return updatedEnrollment;
}

/**
 * Reactivate student in course enrollment
 */
export async function reactivateStudentEnrollment({
  enrollmentId,
  adminNote,
  notifyStudent = true,
}: {
  enrollmentId: string;
  adminNote?: string;
  notifyStudent?: boolean;
}) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: true,
      course: true,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  // Update enrollment to ACTIVE and reset drop markers
  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "ACTIVE",
      reactivatedAt: new Date(),
      droppedAt: null,
      dropReason: null,
    },
  });

  // Resolve any pending reactivation requests
  await prisma.reactivationRequest.updateMany({
    where: {
      enrollmentId,
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      resolvedAt: new Date(),
      adminNote: adminNote || "Access restored by Admin",
    },
  });

  if (notifyStudent && enrollment.user.email) {
    try {
      await sendCourseReactivatedEmail({
        studentName: enrollment.user.name || "Student",
        studentEmail: enrollment.user.email,
        courseTitle: enrollment.course.title,
      });
    } catch (err) {
      console.error("Failed to send course reactivated email:", err);
    }
  }

  return updatedEnrollment;
}

/**
 * Scan all active student enrollments for >= thresholdDays inactivity
 */
export async function scanAndProcessInactiveStudents({
  thresholdDays = 7,
  autoDrop = true,
}: {
  thresholdDays?: number;
  autoDrop?: boolean;
}) {
  // Fetch all active enrollments
  const activeEnrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      userId: true,
      courseId: true,
      user: { select: { role: true } },
    },
  });

  // Filter only students (exclude admin/instructor accounts enrolled in courses)
  const studentEnrollments = activeEnrollments.filter((e) => e.user.role === "STUDENT");

  const inactiveList: StudentActivityDetails[] = [];
  const droppedList: StudentActivityDetails[] = [];

  for (const item of studentEnrollments) {
    const summary = await getStudentActivitySummary(item.userId, item.courseId);
    if (!summary) continue;

    if (summary.inactiveDays >= thresholdDays) {
      inactiveList.push(summary);

      if (autoDrop) {
        const reason = `Automated Drop: Inactive for ${summary.inactiveDays} days (no task submissions, quiz attempts, or course progress)`;
        await dropStudentEnrollment({
          enrollmentId: summary.enrollmentId,
          reason,
          isAutomated: true,
          notifyStudent: true,
        });
        droppedList.push({
          ...summary,
          enrollmentStatus: "DROPPED",
          droppedAt: new Date(),
          dropReason: reason,
        });
      }
    }
  }

  return {
    scannedCount: studentEnrollments.length,
    inactiveCount: inactiveList.length,
    droppedCount: droppedList.length,
    inactiveStudents: inactiveList,
    droppedStudents: droppedList,
  };
}
