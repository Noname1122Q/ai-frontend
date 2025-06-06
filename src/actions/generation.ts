"use server";

import { Storage } from "@google-cloud/storage";
import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { inngest } from "~/inngest/client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function processVideo(uploadedFileId: string) {
  const uploadedVideo = await db.uploadedFile.findUniqueOrThrow({
    where: {
      id: uploadedFileId,
    },
    select: {
      uploaded: true,
      id: true,
      userId: true,
    },
  });

  if (uploadedVideo.uploaded) return;

  await inngest.send({
    name: "process-video-events",
    data: {
      uploadedFileId: uploadedVideo.id,
      userId: uploadedVideo.userId,
    },
  });

  await db.uploadedFile.update({
    where: {
      id: uploadedFileId,
    },
    data: {
      uploaded: true,
    },
  });

  revalidatePath("/dashboard");
}

export async function getClipPlayUrl(
  clipId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const clip = await db.clip.findUniqueOrThrow({
      where: {
        id: clipId,
        userId: session.user.id,
      },
    });

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

    const file = bucket.file(clip.s3Key);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 600 * 1000,
    });

    return { success: true, url: url };
  } catch (error) {}
  return {
    success: false,
    error: "Failed to generate play URL",
  };
  return {
    success: true,
    url: "",
  };
}
