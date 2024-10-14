import { AspectRatio } from "@radix-ui/react-aspect-ratio";

import { cn } from "@/lib/utils";

function ItemImageWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <AspectRatio ratio={1 / 1}>{children}</AspectRatio>
    </div>
  );
}

function StakeItemsGrid({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 py-6 gap-x-2 gap-y-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function RowBreakdown({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex justify-between items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { ItemImageWrapper, RowBreakdown, StakeItemsGrid };
