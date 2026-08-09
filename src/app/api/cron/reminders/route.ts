import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDeadlineWarningEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Verify the request is authorized
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    // We are running this at 6:00 PM PKT (13:00 UTC) daily.
    // We want to catch tasks due tomorrow (up to ~36 hours from now).
    const minDate = new Date(now.getTime());
    const maxDate = new Date(now.getTime() + 36 * 60 * 60 * 1000);

    // 2. Fetch tasks that are due within this window
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: minDate,
          lte: maxDate,
        },
      },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                user: true,
              },
            },
          },
        },
        submissions: true,
      },
    });

    const emailPromises: Promise<any>[] = [];

    // 3. Process each task and check enrollments
    for (const task of upcomingTasks) {
      if (!task.dueDate) continue;

      const submissionsMap = new Set(task.submissions.map((s) => s.userId));

      for (const enrollment of task.course.enrollments) {
        // If the user hasn't submitted yet
        if (!submissionsMap.has(enrollment.userId)) {
          const user = enrollment.user;
          
          if (user.email) {
            emailPromises.push(
              sendDeadlineWarningEmail({
                studentName: user.name || "Student",
                studentEmail: user.email,
                taskTitle: task.title,
                courseTitle: task.course.title,
                dueDate: task.dueDate,
              })
            );
          }
        }
      }
    }

    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Checked ${upcomingTasks.length} tasks. Sent ${emailPromises.length} reminder emails.`,
    });
  } catch (error: any) {
    console.error("Cron Error (Deadline Reminders):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
