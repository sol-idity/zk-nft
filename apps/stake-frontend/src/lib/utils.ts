import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wait = async (seconds = 1): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const getTruncatedString = (
  value: string | undefined | null,
  length: number = 4
) =>
  value === undefined || value === null
    ? ""
    : value.slice(0, length) + "..." + value.slice(-length);
