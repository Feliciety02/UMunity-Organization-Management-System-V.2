import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: CheckCircle2,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: AlertTriangle,
  },
  error: {
    container: "bg-rose-50 border-rose-200 text-rose-800",
    icon: XCircle,
  },
  info: {
    container: "bg-sky-50 border-sky-200 text-sky-800",
    icon: Info,
  },
};

export function AlertBanner({
  variant = "info",
  title,
  description,
  dismissible,
  onDismiss,
  className,
}: {
  variant?: keyof typeof variants;
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div className={cn("relative flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm", v.container, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p>{description}</p>}
      </div>
      {dismissible && (
        <button onClick={onDismiss} className="grid h-6 w-6 place-items-center rounded-full hover:bg-black/5">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function AlertInline({
  variant = "info",
  children,
  className,
}: {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-xs", v.container, className)}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
