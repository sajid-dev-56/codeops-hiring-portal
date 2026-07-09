import { NextRequest, NextResponse } from "next/server";
import { presignUploadSchema } from "@/lib/validations";
import { generatePresignedUploadUrl } from "@/lib/r2";

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

    const { filename, contentType } = validated.data;
    const ext = filename.split(".").pop();
    const key = `cv/${crypto.randomUUID()}.${ext}`;

    const uploadUrl = await generatePresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, fileKey: key });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
