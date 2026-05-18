import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, CalendarCheck2, CheckCircle2, Info, Send, ShieldAlert, UserPlus, XCircle, type LucideIcon } from "lucide-react";

type ImportantAction = "join" | "apply" | "save" | "rsvp";

const ACTION_META: Record<ImportantAction, { icon: LucideIcon; title: string }> = {
  join: { icon: UserPlus, title: "Membership request sent" },
  apply: { icon: Send, title: "Application sent" },
  save: { icon: Bookmark, title: "Saved for later" },
  rsvp: { icon: CalendarCheck2, title: "RSVP updated" },
};

const ACTION_DURATION = 2600;

type StatusTone = "success" | "info" | "warning" | "error";

const STATUS_META: Record<StatusTone, { icon: LucideIcon }> = {
  success: { icon: CheckCircle2 },
  info: { icon: Info },
  warning: { icon: ShieldAlert },
  error: { icon: XCircle },
};

export function showImportantActionToast(
  action: ImportantAction,
  description: string,
  title = ACTION_META[action].title,
) {
  const Icon = ACTION_META[action].icon;
  toast.success(title, {
    description,
    duration: ACTION_DURATION,
    icon: <Icon className="h-4 w-4" />,
  });
}

export function showStatusToast(
  title: string,
  description?: string,
  tone: StatusTone = "success",
) {
  const Icon = STATUS_META[tone].icon;
  const method =
    tone === "error"
      ? toast.error
      : tone === "warning"
        ? toast.warning
        : tone === "info"
          ? toast
          : toast.success;

  method(title, {
    description,
    duration: ACTION_DURATION,
    icon: <Icon className="h-4 w-4" />,
  });
}

export function useDashboardPageLoading(delay = 450) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return loading;
}
