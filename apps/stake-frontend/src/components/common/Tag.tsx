import React from "react";

import { getStakeStatusFromMintItem } from "@/lib/stake";
import { cn } from "@/lib/utils";
import { MintItem } from "@/types/resources";

import { Skeleton } from "../ui/skeleton";
import Typography from "./Typography";

function StakeTag({
  mintItem,
  className,
}: {
  mintItem: MintItem;
  className?: string;
}) {
  const { isStaked, status } = getStakeStatusFromMintItem(mintItem);

  return (
    <div
      className={cn(
        "border border-border rounded-full px-1 py-0.5 flex items-center justify-center w-20 h-5 shadow-sm",
        isStaked ? "bg-unavailable" : "bg-available",
        className
      )}
    >
      <Typography variant="small" className="text-accent capitalize">
        {status}
      </Typography>
    </div>
  );
}

function LoadingStakeTag({ className = "" }: { className?: string }) {
  return <Skeleton className={cn("rounded-full w-20 h-5", className)} />;
}

export { LoadingStakeTag, StakeTag };
