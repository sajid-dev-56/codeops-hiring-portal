import "dotenv/config";
import { prisma } from "../lib/prisma";
import { scanAndProcessInactiveStudents } from "../lib/activity";

async function main() {
  console.log("Scanning inactive students (threshold: 7 days)...");
  const preview = await scanAndProcessInactiveStudents({
    thresholdDays: 7,
    autoDrop: false,
  });

  console.log(`Total Scanned Enrollments: ${preview.scannedCount}`);
  console.log(`Total Inactive (>= 7 days): ${preview.inactiveCount}`);
  console.log("\nInactive Students List:");
  preview.inactiveStudents.forEach((s, idx) => {
    console.log(
      `${idx + 1}. ${s.studentName} (${s.studentEmail}) - Course: "${s.courseTitle}" - ${s.inactiveDays} days inactive (Status: ${s.enrollmentStatus})`
    );
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
