import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHead, Panel, Badge, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { EventCard } from "@/components/events/event-card";
import { defaultEventCover, eventCovers } from "@/components/events/event-covers";
import { events } from "@/data/site";
import { AppTabs } from "@/components/ui/app-tabs";
import { IconButton } from "@/components/ui/icon-button";
import { getSession } from "@/lib/auth";
import { useDashboardPageLoading } from "@/lib/feedback";
import { slugify, useRsvps, type RsvpStatus } from "@/lib/rsvp";

export const Route = createFileRoute("/student/events")({
  validateSearch: (s: Record<string, unknown>) => ({ event: typeof s.event === "string" ? s.event : undefined }),
  component: Events,
});

const tabs = ["All", "RSVP'd", "Saved", "Past"] as const;

const STATUS_TONE: Record<RsvpStatus, "success" | "warning" | "danger"> = {
  going: "success",
  maybe: "warning",
  cancelled: "danger",
};
const STATUS_LABEL: Record<RsvpStatus, string> = {
  going: "You're going",
  maybe: "You're a Maybe",
  cancelled: "RSVP cancelled",
};

function Events() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const { event: eventSlug } = useSearch({ from: "/student/events" });
  const loading = useDashboardPageLoading();
  const rsvps = useRsvps();
  const session = typeof window !== "undefined" ? getSession() : null;
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const myRsvpByTitle = useMemo(() => {
    const map = new Map<string, RsvpStatus>();
    if (!session) return map;
    for (const r of rsvps) if (r.attendeeEmail === session.email) map.set(r.eventTitle, r.status);
    return map;
  }, [rsvps, session]);

  useEffect(() => {
    if (!eventSlug) return;
    const node = refs.current[eventSlug];
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [eventSlug]);

  if (loading) {
    return (
      <>
        <PageHead title="Events" sub="Loading the campus calendar." />
        <div className="mb-5">
          <AppTabs items={tabs} value={tab} onChange={setTab} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <PanelSkeleton key={index} rows={4} />
          ))}
        </div>
        <PanelSkeleton rows={6} className="mt-8" />
      </>
    );
  }

  return (
    <>
      <PageHead title="Events" sub="Discover, RSVP, and save what's next." />

      <div className="mb-5">
        <AppTabs items={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => {
          const slug = slugify(event.title);
          const isHighlighted = eventSlug === slug;
          const myStatus = myRsvpByTitle.get(event.title);
          const badgeNode = myStatus ? (
            <Badge tone={STATUS_TONE[myStatus]}>{STATUS_LABEL[myStatus]}</Badge>
          ) : (
            <Badge tone={index === 0 ? "success" : index === 1 ? "warning" : "info"}>
              {index === 0 ? "RSVP'd" : index === 1 ? "Saved" : event.status}
            </Badge>
          );
          return (
            <div
              key={event.title}
              ref={(el) => { refs.current[slug] = el; }}
              className={`rounded-3xl transition ${isHighlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
            >
              <EventCard
                event={event}
                cover={eventCovers[event.title] ?? defaultEventCover}
                badge={badgeNode}
              />
            </div>
          );
        })}
      </div>

      <Panel className="mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Event Calendar</p>
            <h3 className="mt-1 font-display text-xl font-bold">May 2026</h3>
          </div>
          <div className="flex items-center gap-2">
            <IconButton className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <IconButton className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card/95 p-4 shadow-soft sm:p-5">
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekdayLabels.map((day) => (
              <p key={day} className="pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {day}
              </p>
            ))}

            {calendarCells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="aspect-[0.95]" />;

              const event = calendarEvents[cell];
              return (
                <div
                  key={cell}
                  className={`group flex aspect-[0.95] flex-col rounded-2xl border p-2.5 text-left transition ${
                    event
                      ? "border-primary/15 bg-[color:color-mix(in_oklab,var(--primary)_7%,white)] shadow-soft"
                      : "border-transparent bg-card/70 hover:border-border hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${event ? "text-primary" : "text-foreground"}`}>{cell}</span>
                    {event ? <span className={`mt-1 h-2 w-2 rounded-full ${event.dot}`} /> : null}
                  </div>

                  <div className="mt-auto min-h-[2.5rem]">
                    {event ? (
                      <>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-foreground">{event.label}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{event.time}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-transparent">.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Object.values(calendarEvents).map((event) => (
            <div key={event.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${event.dot}`} />
              <span className="font-medium text-foreground">{event.label}</span>
              <span>{event.time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarCells: Array<number | null> = [
  null, null, null, null, null, 1, 2,
  3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30,
  31, null, null, null, null, null, null,
];

const calendarEvents: Record<number, { label: string; time: string; dot: string }> = {
  24: { label: "Innovation Summit", time: "9:00 AM", dot: "bg-primary" },
  30: { label: "Eco Run", time: "5:30 AM", dot: "bg-emerald-500" },
};
