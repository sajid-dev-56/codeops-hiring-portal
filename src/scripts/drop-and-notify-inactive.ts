import "dotenv/config";
import { prisma } from "../lib/prisma";
import { scanAndProcessInactiveStudents } from "../lib/activity";

async function main() {
  console.log("🚀 Starting Inactive Students Drop & Notification Process...");
  console.log("Criteria: >= 7 days of inactivity across tasks, quizzes, lessons & portal activity.");

  const result = await scanAndProcessInactiveStudents({
    thresholdDays: 7,
    autoDrop: true,
  });

  console.log(`\n✅ Summary of Execution:`);
  console.log(`- Scanned Enrollments: ${result.scannedCount}`);
  console.log(`- Inactive Identified: ${result.inactiveCount}`);
  console.log(`- Students Dropped & Notified via Email: ${result.droppedCount}`);

  console.log(`\n📧 Dropped Students List:`);
  result.droppedStudents.forEach((s, idx) => {
    console.log(
      `${idx + 1}. ${s.studentName} (${s.studentEmail}) - Course: "${s.courseTitle}" [${s.inactiveDays} days inactive]`
    );
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
