import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const candidateId = id;

    // Get the candidate to check if they have a CV
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { cvFileKey: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Delete CV from Supabase if it exists
    if (candidate.cvFileKey) {
      const { error } = await supabaseAdmin.storage
        .from("cvs")
        .remove([candidate.cvFileKey]);
      
      if (error) {
        console.error("Failed to delete CV from Supabase:", error);
        // Continue deleting candidate from DB even if CV delete fails
      }
    }

    // Delete candidate from DB
    await prisma.candidate.delete({
      where: { id: candidateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
