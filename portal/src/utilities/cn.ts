import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const styles = (...styles: (string | object)[]) => {
  return twMerge(clsx(...styles));
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
