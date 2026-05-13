import { Bookmark, Clock, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { AppBadge } from "@/components/ui/app-badge";
import { AppCard } from "@/components/ui/app-card";
import { IconButton } from "@/components/ui/icon-button";
import { RsvpButton } from "@/components/events/rsvp-button";

type EventData = {
  title: string;
  date: string;
  time: string;
  venue: string;
  host: string;
  status: string;
};

export function EventCard({
  event,
  cover,
  badge,
  floatingDate = true,
  actionLabel: _actionLabel = "RSVP",
  compact = false,
  footerAction,
}: {
  event: EventData;
  cover: string;
  badge?: ReactNode;
  floatingDate?: boolean;
  actionLabel?: string;
  compact?: boolean;
  footerAction?: ReactNode;
}) {
  return (
    <AppCard className="group overflow-hidden rounded-3xl transition hover:-translate-y-0.5 hover:shadow-soft" padded={false}>
      <div className="relative h-36 rounded-t-3xl bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${cover}")` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/16 via-transparent to-black/12" />
        <IconButton tone="soft" className="absolute right-3 top-3 h-8 w-8">
          <Bookmark className="h-4 w-4" />
        </IconButton>
        {floatingDate ? (
          <div className="absolute bottom-0 left-5 flex h-[68px] w-[72px] translate-y-1/2 flex-col items-center justify-center rounded-[22px] border-4 border-white bg-gradient-maroon text-center shadow-soft">
            <p className="font-display text-[2rem] font-bold leading-none text-white">{event.date.split(" ")[1].replace(",", "")}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-white/90">{event.date.split(" ")[0]}</p>
          </div>
        ) : null}
      </div>
      <div className={compact ? "space-y-3 p-4" : "p-5 pt-11"}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{event.host}</p>
          {badge ?? <AppBadge>{event.status}</AppBadge>}
        </div>
        <h3 className="mt-2 font-display text-base font-bold">{event.title}</h3>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {event.time}</p>
          <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {event.venue}</p>
        </div>
        <div className="mt-4">{footerAction ?? <RsvpButton eventTitle={event.title} size={compact ? "sm" : "md"} />}</div>
      </div>
    </AppCard>
  );
}
