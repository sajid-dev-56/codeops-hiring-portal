import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendDeadlineWarningEmail, sendCongratulationsEmail } from "../lib/email";

async function run() {
  const tasks = await prisma.task.findMany({
    include: {
      course: {
        include: {
          enrollments: {
            include: { user: true }
          }
        }
      },
      submissions: true
    }
  });

  const promises = [];

  for (const task of tasks) {
    if (!task.dueDate) continue;

    const submissionsMap = new Map(task.submissions.map(s => [s.userId, s]));

    for (const enrollment of task.course.enrollments) {
      const user = enrollment.user;
      if (!user.email) continue;

      const submission = submissionsMap.get(user.id);
      if (submission) {
        promises.push(sendCongratulationsEmail({
          studentName: user.name || "Student",
          studentEmail: user.email,
          taskTitle: task.title,
          courseTitle: task.course.title,
          marks: submission.marks || submission.aiMarks || 0,
          maxMarks: task.maxMarks || 100
        }));
      } else {
        promises.push(sendDeadlineWarningEmail({
          studentName: user.name || "Student",
          studentEmail: user.email,
          taskTitle: task.title,
          courseTitle: task.course.title,
          dueDate: task.dueDate
        }));
      }
    }
  }

  console.log(`Sending ${promises.length} emails...`);
  await Promise.allSettled(promises);
  console.log(`Successfully processed ${promises.length} emails.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
