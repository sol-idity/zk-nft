import React from "react";

import { cn } from "@/lib/utils";

type TypographyVariant =
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
  | "muted";

const styles = (variant: TypographyVariant) =>
  cn(
    variant === "h1" &&
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    variant === "h2" &&
      "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
    variant === "h3" && "scroll-m-20 text-2xl font-semibold tracking-tight",
    variant === "h4" && "scroll-m-20 text-xl font-semibold tracking-tight",
    variant === "h5" && "text-sm font-medium leading-none",
    variant === "h6" && "text-xs font-medium leading-none",
    variant === "base" && "leading-7",
    variant === "sm" && "text-sm",
    variant === "blockquote" && "mt-6 border-l-2 pl-6 italic",
    variant === "inlineCode" &&
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    variant === "lead" && "text-xl text-muted-foreground",
    variant === "large" && "text-lg font-semibold",
    variant === "small" && "text-sm font-medium leading-none",
    variant === "muted" && "text-sm text-muted-foreground",
    "text-balance"
  );

interface TypographyProps {
  variant?: TypographyVariant;
  children?: React.ReactNode;
  as?:
    | keyof JSX.IntrinsicElements
    | React.ComponentType<React.HTMLProps<HTMLElement>>;
  truncate?: boolean;
  className?: string;
}

export default function Typography({
  variant = "base",
  className = "",
  as: asProp,
  truncate = false,
  children,
  ...props
}: TypographyProps) {
  const As =
    asProp !== undefined
      ? asProp
      : variant === "h1"
      ? "h1"
      : variant === "h2"
      ? "h2"
      : variant === "h3"
      ? "h3"
      : variant === "h4"
      ? "h4"
      : variant === "h5"
      ? "h5"
      : variant === "h6"
      ? "h6"
      : variant === "sm"
      ? "span"
      : variant === "blockquote"
      ? "blockquote"
      : variant === "inlineCode"
      ? "code"
      : variant === "small"
      ? "small"
      : "p";
  return (
    <As
      className={cn(styles(variant), truncate && "truncate", className)}
      {...props}
    >
      {children}
    </As>
  );
}
