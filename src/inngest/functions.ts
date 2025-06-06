import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { Storage } from "@google-cloud/storage";
import { unknown } from "zod";

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1,
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  { event: "process-video-events" },
  async ({ event, step }) => {
    const { uploadedFileId } = event.data as {
      uploadedFileId: string;
      userId: string;
    };

    try {
      const { userId, credits, s3Key } = await step.run(
        "check-credits",
        async () => {
          const uploadedFile = await db.uploadedFile.findUnique({
            where: {
              id: uploadedFileId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  credits: true,
                },
              },
              s3Key: true,
            },
          });

          return {
            userId: uploadedFile?.user.id,
            credits: uploadedFile?.user.credits,
            s3Key: uploadedFile?.s3Key,
          };
        },
      );

      if (credits && credits > 0) {
        await step.run("set-status-processing", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processing",
            },
          });
        });

        await step.run("call-modal-endpoint", async () => {
          await fetch(env.PROCESS_VIDEO_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({ s3_key: s3Key }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
            },
          });
        });

        const { clipsFound } = await step.run(
          "create-clips-in-db",
          async () => {
            const folderPrefix = s3Key?.split("/")[0];

            const allKeys = await listGcsObjectsByPrefix(folderPrefix!);
            const clipKeys = allKeys.filter(
              (key): key is string =>
                key !== undefined && !key.endsWith("original.mp4"),
            );

            if (clipKeys.length > 0) {
              await db.clip.createMany({
                data: clipKeys.map((clipKey) => ({
                  s3Key: clipKey,
                  uploadedFileId,
                  userId: userId!,
                })),
              });
            }

            return { clipsFound: clipKeys.length };
          },
        );

        await step.run("deduct-credits", async () => {
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              credits: {
                decrement: Math.min(credits, clipsFound),
              },
            },
          });
        });

        await step.run("set-status-processed", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processed",
            },
          });
        });
      } else {
        await step.run("set-status-no-credits", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "no-credits",
            },
          });
        });
      }
    } catch (error: unknown) {
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });
    }
  },
);
async function listGcsObjectsByPrefix(prefix: string): Promise<string[]> {
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

  const bucketName = env.GCS_BUCKET_NAME;
  const bucket = gcs_client.bucket(bucketName);

  // getFiles({ prefix }) will return all files whose names start with that prefix.
  const [files] = await bucket.getFiles({ prefix });

  // Map to just the file names/keys, filter out any falsy values
  return files
    .map((file) => file.name)
    .filter((name): name is string => Boolean(name));
}
