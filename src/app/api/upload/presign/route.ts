import { NextRequest, NextResponse } from "next/server";
import { presignUploadSchema } from "@/lib/validations";
import { generatePresignedUploadUrl } from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = presignUploadSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { filename } = validated.data;
    const ext = filename.split(".").pop();
    const key = `${crypto.randomUUID()}.${ext}`;

    const { signedUrl, token, path } = await generatePresignedUploadUrl(key);

    return NextResponse.json({ uploadUrl: signedUrl, token, path, fileKey: path });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
