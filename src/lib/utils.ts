import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function triggerViewRefresh() {
  try {
    localStorage.setItem('memboard-settings-updated', Date.now().toString());
  } catch {
    // ignore write errors (e.g., SSR or private mode)
  }
}
