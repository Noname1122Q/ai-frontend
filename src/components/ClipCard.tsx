"use state";
import type { Clip } from "@prisma/client";
import { Download, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getClipPlayUrl } from "~/actions/generation";
import { Button } from "./ui/button";

type Props = {
  clip: Clip;
};

const ClipCard = ({ clip }: Props) => {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPlayUrl() {
      setIsLoading(true);
      try {
        const { success, error, url } = await getClipPlayUrl(clip.id);
        if (success && url) {
          setPlayUrl(url);
        } else if (error) {
          console.error(`Failed to get play url: ${error}`);
        }
      } catch (error) {
        console.error(`Failed to get play url.`);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPlayUrl();
  }, [clip.id]);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex max-w-52 flex-col gap-2">
      <div className="bg-muted">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : playUrl ? (
          <video
            src={playUrl}
            controls
            preload="metadata"
            className="h-full w-full rounded-md object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="text-muted-foreground size-10 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant={"outline"} size={"sm"} onClick={handleDownload}>
          <Download className="mr-2 size-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default ClipCard;
