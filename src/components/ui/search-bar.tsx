import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder = "Search...",
  shortcut,
  className,
}: {
  placeholder?: string;
  shortcut?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-soft", className)}>
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {shortcut ? <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">{shortcut}</kbd> : null}
    </div>
  );
}
