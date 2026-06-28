import { Search, X, ArrowUpDown, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TableSearchBar({
  value, onChange, placeholder = "Search...", className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex h-11 min-w-[200px] flex-1 items-center gap-2.5 rounded-2xl border border-border bg-card/88 px-3.5 shadow-soft", className)}>
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {value && (
        <button onClick={() => onChange("")} className="grid h-6 w-6 place-items-center rounded-full hover:bg-secondary">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function TableFilterSelect({
  value, onChange, options, label, className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card/88 px-4 pr-8 text-sm font-medium text-foreground appearance-none cursor-pointer hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {label && <option value="">{label}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function TableSortButton({
  label, sortKey, currentKey, direction, onChange, className,
}: {
  label: string;
  sortKey: string;
  currentKey?: string;
  direction?: "asc" | "desc" | false;
  onChange: (key: string, dir: "asc" | "desc") => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <button
      onClick={() => onChange(sortKey, active && direction === "asc" ? "desc" : "asc")}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card/88 px-4 text-sm font-medium transition hover:bg-secondary",
        active ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      <ArrowUpDown className="h-4 w-4" />
      {label}
    </button>
  );
}

export function TableFilterToggle({
  active, onClick, label, className,
}: {
  active?: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card/88 px-4 text-sm font-medium transition hover:bg-secondary",
        active ? "text-foreground border-primary/40" : "text-muted-foreground",
        className,
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {label || "Filters"}
    </button>
  );
}
