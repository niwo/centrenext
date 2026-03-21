import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[1.75rem] border border-[rgb(var(--border-soft)/0.5)] bg-[rgb(var(--surface-card)/0.86)] p-6 shadow-soft", className)} {...props} />;
}