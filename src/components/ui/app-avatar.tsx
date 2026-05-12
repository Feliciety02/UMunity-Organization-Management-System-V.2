import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppAvatar({
  children,
  className,
  ring = false,
}: {
  children: ReactNode;
  className?: string;
  ring?: boolean;
}) {
  return (
    <div className={cn("grid place-items-center rounded-full", ring && "ring-4 ring-white", className)}>
      {children}
    </div>
  );
}
