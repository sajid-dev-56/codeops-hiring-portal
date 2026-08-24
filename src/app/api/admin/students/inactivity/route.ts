import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanAndProcessInactiveStudents } from "@/lib/activity";

// GET /api/admin/students/inactivity - Preview inactive students (autoDrop = false)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const thresholdDays = parseInt(searchParams.get("thresholdDays") || "7", 10);

    const result = await scanAndProcessInactiveStudents({
      thresholdDays: isNaN(thresholdDays) ? 7 : thresholdDays,
      autoDrop: false,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Admin Inactivity Preview Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/students/inactivity - Execute bulk drop on inactive students
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const thresholdDays = typeof body.thresholdDays === "number" ? body.thresholdDays : 7;

    const result = await scanAndProcessInactiveStudents({
      thresholdDays,
      autoDrop: true,
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${result.scannedCount} enrollments. Auto-dropped ${result.droppedCount} inactive students.`,
      ...result,
    });
  } catch (error: any) {
    console.error("Admin Inactivity Scan Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
