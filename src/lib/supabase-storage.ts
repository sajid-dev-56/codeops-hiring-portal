import { createClient } from "@supabase/supabase-js";

// We use the service role key on the backend to bypass RLS and securely generate presigned URLs.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-key-for-build"
);

const BUCKET = "cvs";

/**
 * Generates a presigned URL for uploading files from the client.
 */
export async function generatePresignedUploadUrl(key: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(key);

  if (error) {
    throw error;
  }

  // data contains: { signedUrl, path, token }
  return data;
}

/**
 * Generates a presigned URL for downloading/viewing a file.
 */
export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(key, 3600); // 1 hour

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
