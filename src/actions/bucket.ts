"use server";

import { Storage } from "@google-cloud/storage";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { v4 as uuid } from "uuid";
import { db } from "~/server/db";

export async function generateUploadUrl(fileInfo: {
  filename: string;
  contentType: string;
}): Promise<{
  success: boolean;
  signedUrl: string;
  key: string;
  uploadedFileId: string;
}> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const gcs_client = new Storage({
    credentials: {
      client_email: env.GCS_CLIENT_EMAIL,
      private_key: env.GCS_PRIVATE_KEY,
      project_id: env.GCS_PROJECT_ID,
    },
  });
  await gcs_client.bucket(env.GCS_BUCKET_NAME).setCorsConfiguration([
    {
      origin: [env.BASE_URL],
      responseHeader: ["Content-Type"],
      method: ["PUT", "POST", "GET", "HEAD"],
      maxAgeSeconds: 3600,
    },
  ]);

  const bucket = gcs_client.bucket(env.GCS_BUCKET_NAME);

  const fileExtension = fileInfo.filename.split(".").pop() ?? "";

  const uniqueId = uuid();
  const key = `${uniqueId}/original.${fileExtension}`;

  const file = bucket.file(key);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 600 * 1000,
    contentType: fileInfo.contentType,
  });

  const uploadedFileDBRecord = await db.uploadedFile.create({
    data: {
      userId: session.user.id,
      s3Key: key,
      displayName: fileInfo.filename,
      uploaded: false,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    signedUrl: url,
    key,
    uploadedFileId: uploadedFileDBRecord.id,
  };
}
