import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidates = await prisma.candidate.findMany({
      include: {
        job: { select: { title: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV header
    let csv = "ID,Name,Email,Phone,Job Title,Department,Stage,Source,Expected Salary,Notice Period,Portfolio,Applied At,Custom Answers\n";

    // Add rows
    candidates.forEach((c) => {
      const customAnswersString = c.customAnswers 
        ? JSON.stringify(c.customAnswers).replace(/"/g, '""') 
        : "";

      const row = [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone || ""}"`,
        `"${c.job.title}"`,
        `"${c.job.department}"`,
        `"${c.stage}"`,
        `"${c.source || ""}"`,
        `"${c.expectedSalary || ""}"`,
        `"${c.noticePeriod || ""}"`,
        `"${c.portfolioUrl || ""}"`,
        `"${c.createdAt.toISOString()}"`,
        `"${customAnswersString}"`
      ].join(",");

      csv += row + "\n";
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", `attachment; filename="candidates_export_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csv, { status: 200, headers });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
