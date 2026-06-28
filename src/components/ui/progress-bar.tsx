import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("space-y-1.5", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between">
          {label ? <span className="text-xs font-semibold text-foreground">{label}</span> : null}
          {showValue ? <span className="text-xs text-muted-foreground">{pct}%</span> : null}
        </div>
      ) : null}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-primary/10",
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gradient-gold transition-all duration-500",
            sizeClasses[size],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
