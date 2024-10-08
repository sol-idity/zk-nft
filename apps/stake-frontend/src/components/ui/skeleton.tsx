import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

type StyledSkeletonVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "base"
  | "sm"
  | "blockquote"
  | "inlineCode"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "link";

const styles = {
  typography: (variant: StyledSkeletonVariant) =>
    cn(
      variant === "h1" && "h-10 lg:h-12 w-3/4",
      variant === "h2" && "h-9 w-2/3",
      variant === "h3" && "h-8 lg:h-10 w-1/2",
      variant === "h4" && "h-7 lg:h-8 w-1/2",
      variant === "h5" && "h-5 w-1/3",
      variant === "h6" && "h-4 2-1/4",
      variant === "base" && "h-4 w-full",
      variant === "sm" && "h-4 w-auto",
      variant === "blockquote" && "h-8 lg:h-10 w-4/5",
      variant === "lead" && "h-6 lg:h-8 w-3/4",
      variant === "large" && "h-6 lg:h-7 w-2/3",
      variant === "small" && "h-3 w-1/3",
      variant === "inlineCode" && "h-4 w-auto",
      variant === "muted" && "h-4 w-1/2"
    ),
  other: (variant: StyledSkeletonVariant) =>
    cn(variant === "link" && "w-4 h-4"),
};

interface StyledSkeletonProps {
  variant?: StyledSkeletonVariant;
  className?: string;
}

function StyledSkeleton({
  variant = "base",
  className = "",
}: StyledSkeletonProps) {
  const style =
    variant === "link" ? styles.other(variant) : styles.typography(variant);

  return <Skeleton className={cn(style, className)} />;
}

export { Skeleton, StyledSkeleton };
