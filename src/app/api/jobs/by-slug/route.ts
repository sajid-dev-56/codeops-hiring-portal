import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { slug },
    select: { id: true, status: true, customQuestions: true },
  });

  if (!job || job.status !== "OPEN") {
    return NextResponse.json(
      { error: "Job not found or not open" },
      { status: 404 }
    );
  }

  return NextResponse.json({ 
    jobId: job.id,
    customQuestions: job.customQuestions 
      ? (typeof job.customQuestions === "string" ? JSON.parse(job.customQuestions) : job.customQuestions)
      : [] 
  });
}
