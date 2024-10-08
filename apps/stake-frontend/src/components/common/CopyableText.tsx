import { CopyIcon } from "@radix-ui/react-icons";
import React, { useCallback } from "react";

import { cn, getTruncatedString } from "@/lib/utils";

import { useToast } from "../ui/use-toast";
import Typography from "./Typography";

interface CopyableTextProps {
  text: string;
  showingText?: string;
  truncate?: boolean;
  className?: string;
}

export default function CopyableText({
  text,
  showingText,
  truncate = false,
  className = "",
  ...props
}: CopyableTextProps) {
  const { toast } = useToast();

  const onCopyClick = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: text,
    });
  }, [text, toast]);

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        onClick={onCopyClick}
        className="text-gray-500 hover:text-[#000] dark:hover:text-[#FFF]"
      >
        <CopyIcon />
      </button>
      <Typography>
        {truncate
          ? getTruncatedString(showingText ?? text)
          : showingText ?? text}
      </Typography>
    </div>
  );
}
