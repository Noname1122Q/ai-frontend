import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-12">
      <Loader2 className="text-muted-foreground size-12 animate-spin" />
      <span className="ml-3 text-lg">Loading dashboard...</span>
    </div>
  );
};

export default Loading;
