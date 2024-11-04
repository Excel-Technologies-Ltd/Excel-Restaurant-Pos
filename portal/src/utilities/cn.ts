import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const styles = (...styles: (string | object)[]) => {
  return twMerge(clsx(...styles));
};
