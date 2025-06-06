"use client";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import { Loader, Loader2, UploadCloud } from "lucide-react";
import { generateUploadUrl } from "~/actions/bucket";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import ClipDisplay from "./ClipDisplay";
import { format } from "date-fns";

type Props = {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
};

const DashboardClient = ({ uploadedFiles, clips }: Props) => {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0]!;

    setUploading(true);

    try {
      const { signedUrl, success, uploadedFileId } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type,
      });

      if (!success) throw new Error("Failed to generate upload URL");

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (!uploadResponse.ok)
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);

      await processVideo(uploadedFileId);

      setFiles([]);

      toast.success("Video uploaded successfully!", {
        description: "Your video is scheduled for processing.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Upload failed", {
        description:
          "There was a problem uploading your video. Please try again.",
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Podcast Clipper
          </h1>
          <p className="text-muted-foreground">
            Upload your podcast and get AI-generated clips instantly.
          </p>
        </div>
        <Link href={"/dashboard/billing"}>
          <Button>Buy Credits</Button>
        </Link>
      </div>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="my-clips">My Clips</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Podcast</CardTitle>
              <CardDescription>
                Upload your video files to generate clips.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "video/mp4": [".mp4"] }}
                maxSize={500 * 1024 * 1024}
                disabled={uploading}
                maxFiles={1}
              >
                {(dropzone: DropzoneState) => (
                  <>
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center">
                      <UploadCloud className="text-muted-foreground size-12" />
                      <p className="font-medium">Drag and drop your file</p>
                      <p className="text-muted-foreground text-sm">
                        or click to upload your file (MAX SIZE: 500MB)
                      </p>
                      <Button
                        className="cursor-pointer"
                        variant={"default"}
                        size={"sm"}
                        disabled={uploading}
                      >
                        Select File
                      </Button>
                    </div>
                  </>
                )}
              </Dropzone>
              <div className="mt-2 flex items-start justify-between">
                <div>
                  {files.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Selected file:</p>
                      {files.map((file) => (
                        <p key={file.name} className="text-muted-foreground">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  disabled={files.length === 0 || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? (
                    <>
                      <Loader className="mr-2 size-4 animate-spin" />
                      Uploading ...
                    </>
                  ) : (
                    "Upload and generate clips"
                  )}
                </Button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="mb-2 font-medium">Queue status</h3>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Clips created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-xs truncate font-medium">
                              {item.filename}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(
                                new Date(item.createdAt),
                                "yyyy-MM-dd HH:mm:ss",
                              )}
                            </TableCell>
                            <TableCell>
                              {item.status === "queued" && (
                                <Badge className="" variant={"outline"}>
                                  Queued
                                </Badge>
                              )}
                              {item.status === "processing" && (
                                <Badge className="" variant={"outline"}>
                                  Processing
                                </Badge>
                              )}
                              {item.status === "processed" && (
                                <Badge
                                  className="bg-emerald-500 text-gray-600 dark:bg-emerald-600 dark:text-gray-200"
                                  variant={"outline"}
                                >
                                  Processed
                                </Badge>
                              )}
                              {item.status === "no-credits" && (
                                <Badge className="" variant={"destructive"}>
                                  No Credits
                                </Badge>
                              )}
                              {item.status === "failed" && (
                                <Badge className="" variant={"destructive"}>
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.clipsCount > 0 ? (
                                <span>{item.clipsCount} clip(s)</span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No clips yet.
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="my-clips">
          <Card>
            <CardHeader>
              <CardTitle>My Clips</CardTitle>
              <CardDescription>
                View and manage your generated clips here. Processing may take a
                few minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipDisplay clips={clips} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardClient;
