import { useMemo } from "react";
import { Check, ChevronDown, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/app-button";
import { getSession } from "@/lib/auth";
import { setRsvp, useRsvps, type RsvpStatus } from "@/lib/rsvp";

const labels: Record<RsvpStatus | "none", { label: string; icon: typeof Check; tone: "gold" | "secondary" | "ghost" }> = {
  going: { label: "Going", icon: Check, tone: "gold" },
  maybe: { label: "Maybe", icon: HelpCircle, tone: "secondary" },
  cancelled: { label: "Not going", icon: X, tone: "ghost" },
  none: { label: "RSVP", icon: Check, tone: "gold" },
};

export function RsvpButton({ eventTitle, size = "md" }: { eventTitle: string; size?: "sm" | "md" | "lg" }) {
  const rsvps = useRsvps();
  const session = typeof window !== "undefined" ? getSession() : null;
  const mine = useMemo(
    () => rsvps.find((r) => r.eventTitle === eventTitle && r.attendeeEmail === session?.email),
    [rsvps, eventTitle, session?.email],
  );
  const status: RsvpStatus | "none" = mine?.status ?? "none";
  const meta = labels[status];
  const Icon = meta.icon;

  function handle(next: RsvpStatus) {
    if (!session) {
      toast.error("Sign in to RSVP");
      return;
    }
    setRsvp({
      eventTitle,
      status: next,
      attendeeName: session.name,
      attendeeEmail: session.email,
      program: session.program,
    });
    toast.success(
      next === "going" ? "You're going! 🎉" : next === "maybe" ? "Marked as Maybe" : "RSVP cancelled",
    );
  }

  return (
    <div className="group/rsvp relative inline-flex w-full">
      <AppButton variant={meta.tone} size={size} className="w-full">
        <Icon className="h-4 w-4" />
        {meta.label}
        <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" />
      </AppButton>
      <div className="invisible absolute right-0 top-full z-20 mt-1 w-48 rounded-2xl border border-border bg-card p-1 opacity-0 shadow-soft transition group-hover/rsvp:visible group-hover/rsvp:opacity-100 group-focus-within/rsvp:visible group-focus-within/rsvp:opacity-100">
        <Option active={status === "going"} onClick={() => handle("going")}>
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Going
        </Option>
        <Option active={status === "maybe"} onClick={() => handle("maybe")}>
          <HelpCircle className="h-3.5 w-3.5 text-amber-600" /> Maybe
        </Option>
        <Option active={status === "cancelled"} onClick={() => handle("cancelled")}>
          <X className="h-3.5 w-3.5 text-rose-600" /> {mine && status !== "cancelled" ? "Cancel RSVP" : "Not going"}
        </Option>
      </div>
    </div>
  );
}

function Option({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
        active ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
