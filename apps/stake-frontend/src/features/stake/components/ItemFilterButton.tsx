import React from "react";

import Typography from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemFilterButtonProps {
  variant: "available" | "staked";
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export default function ItemFilterButton({
  variant,
  selected,
  onClick,
  className = "",
}: ItemFilterButtonProps) {
  return (
    <Button
      variant="link"
      className={cn("rounded-full px-2 flex items-center gap-2", className)}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          variant === "available" &&
            selected &&
            "bg-available shadow-available",
          variant === "available" && !selected && "bg-available bg-opacity-50",
          variant === "staked" &&
            selected &&
            "bg-unavailable shadow-unavailable",
          variant === "staked" && !selected && "bg-unavailable bg-opacity-50"
        )}
      />
      <Typography
        variant="sm"
        className={cn("hidden md:block capitalize", !selected && "opacity-75")}
      >
        {variant}
      </Typography>
    </Button>
  );
}
