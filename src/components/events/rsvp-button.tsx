import { useEffect, useState } from "react";
import { Check, ChevronDown, HelpCircle, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession } from "@/lib/auth";
import { showImportantActionToast, showStatusToast } from "@/lib/feedback";
import { setRsvp, useRsvps, type RsvpStatus } from "@/lib/rsvp";

const labels: Record<RsvpStatus, { label: string; icon: typeof Check; tone: "gold" | "secondary" | "ghost" }> = {
  going: { label: "Going", icon: Check, tone: "gold" },
  maybe: { label: "Maybe", icon: HelpCircle, tone: "secondary" },
  cancelled: { label: "Not going", icon: X, tone: "ghost" },
};

const toastFor: Record<RsvpStatus, (title: string) => string> = {
  going: (t) => `You're on the list for ${t}.`,
  maybe: (t) => `We'll keep ${t} handy while you decide.`,
  cancelled: (t) => `${t} has been removed from your RSVP list.`,
};

/**
 * One button per event. With no RSVP yet a single click marks you as going; after that the button
 * shows your answer and opens a menu to change it (works by click, tap and keyboard).
 */
export function RsvpButton({ eventTitle, size = "md" }: { eventTitle: string; size?: "sm" | "md" | "lg" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const rsvps = useRsvps();
  const session = mounted ? getSession() : null;
  const mine = session ? rsvps.find((r) => r.eventTitle === eventTitle && r.attendeeEmail === session.email) : undefined;

  function handle(next: RsvpStatus) {
    if (!session) {
      showStatusToast("Sign in to RSVP", "You need an account before reserving a slot.", "error");
      return;
    }
    if (mine?.status === next) return;
    setRsvp({
      eventTitle,
      status: next,
      attendeeName: session.name,
      attendeeEmail: session.email,
      program: session.program,
    });
    showImportantActionToast("rsvp", toastFor[next](eventTitle));
  }

  if (!mine) {
    return (
      <AppButton variant="gold" size={size} className="w-full" onClick={() => handle("going")}>
        <Check className="h-4 w-4" />
        RSVP
      </AppButton>
    );
  }

  const meta = labels[mine.status];
  const Icon = meta.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AppButton variant={meta.tone} size={size} className="w-full" aria-label={`RSVP: ${meta.label}. Change`}>
          <Icon className="h-4 w-4" />
          {meta.label}
          <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" />
        </AppButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1">
        <DropdownMenuItem onSelect={() => handle("going")} className={itemClass(mine.status === "going")}>
          <Check className="text-emerald-600" /> Going
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handle("maybe")} className={itemClass(mine.status === "maybe")}>
          <HelpCircle className="text-primary" /> Maybe
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handle("cancelled")} className={itemClass(mine.status === "cancelled")}>
          <X className="text-rose-600" /> {mine.status === "cancelled" ? "Not going" : "Cancel RSVP"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function itemClass(active: boolean) {
  return `rounded-xl px-3 py-2 text-xs font-medium ${active ? "bg-secondary text-foreground" : "text-foreground/80"}`;
}
