import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedDownloadUrl } from "@/lib/supabase-storage";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileKey = request.nextUrl.searchParams.get("key");
  if (!fileKey) {
    return NextResponse.json(
      { error: "File key is required" },
      { status: 400 }
    );
  }

  try {
    const downloadUrl = await generatePresignedDownloadUrl(fileKey);
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Download URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
