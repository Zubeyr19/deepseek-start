// utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values using clsx and processes them with tailwind-merge
 * Works in Vue the same way as in React
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}