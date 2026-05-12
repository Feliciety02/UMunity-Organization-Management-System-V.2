import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconButton({
  children,
  className,
  tone = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; tone?: "default" | "ghost" | "soft" }) {
  return (
    <button
      className={cn(
        "grid h-10 w-10 place-items-center transition",
        tone === "default" && "rounded-xl border border-border bg-background hover:bg-secondary",
        tone === "ghost" && "rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground",
        tone === "soft" && "rounded-full bg-white/90 text-primary-deep backdrop-blur hover:bg-gold",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
