"use client";
import type { Clip } from "@prisma/client";
import React from "react";
import ClipCard from "./ClipCard";

type Props = {
  clips: Clip[];
};

const ClipDisplay = ({ clips }: Props) => {
  if (clips.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center">
        No clips generated yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {clips.map((clip) => (
        <ClipCard clip={clip} key={clip.id} />
      ))}
    </div>
  );
};

export default ClipDisplay;
