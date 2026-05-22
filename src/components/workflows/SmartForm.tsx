import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/dashboard/DashboardLayout";

export function SmartFormSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SmartField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  icon?: LucideIcon;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-80"
      />
    </label>
  );
}

export function SmartSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SmartTextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none"
      />
    </label>
  );
}

export function SmartProgressCard({
  title,
  pct,
  summary,
  steps,
  draftLabel = "Auto-save enabled",
}: {
  title: string;
  pct: number;
  summary: string;
  steps: { title: string; detail: string; active?: boolean }[];
  draftLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{summary}</p>
        </div>
        <Badge tone="info">{draftLabel}</Badge>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Readiness</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {steps.map((step) => (
          <div key={step.title} className={`rounded-2xl border px-4 py-3 ${step.active ? "border-primary/30 bg-primary/8" : "border-border bg-background"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{step.title}</p>
              {step.active ? <Badge tone="info">Current</Badge> : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
