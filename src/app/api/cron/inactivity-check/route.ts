import { NextResponse } from "next/server";
import { scanAndProcessInactiveStudents } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Verify request authorization for Cron
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await scanAndProcessInactiveStudents({
      thresholdDays: 7,
      autoDrop: true,
    });

    return NextResponse.json({
      success: true,
      message: `Inactivity scan completed. Checked ${result.scannedCount} active enrollments. Found ${result.inactiveCount} inactive, auto-dropped ${result.droppedCount} students.`,
      result,
    });
  } catch (error: any) {
    console.error("Cron Error (Inactivity Check):", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
