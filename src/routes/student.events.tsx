import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { EventCard } from "@/components/events/event-card";
import { defaultEventCover, eventCovers } from "@/components/events/event-covers";
import { events, pastEvents } from "@/data/site";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { IconButton } from "@/components/ui/icon-button";
import { getSession } from "@/lib/auth";
import { useDashboardPageLoading } from "@/lib/feedback";
import { slugify, useRsvps, type RsvpStatus } from "@/lib/rsvp";
import { useSaved } from "@/lib/saved";

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

const EMPTY_COPY: Record<(typeof tabs)[number], { title: string; sub: string }> = {
  All: { title: "No upcoming events", sub: "New campus events will show up here." },
  "RSVP'd": { title: "No RSVPs yet", sub: "Choose Going or Maybe on an event to keep it here." },
  Saved: { title: "No saved events", sub: "Tap the bookmark on an event card to save it for later." },
  Past: { title: "No past events", sub: "Events you could have attended will appear here." },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOTS = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500", "bg-violet-500"];

function Events() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const { event: eventSlug } = useSearch({ from: "/student/events" });
  const loading = useDashboardPageLoading();
  const rsvps = useRsvps();
  const savedTitles = useSaved().events;
  const session = typeof window !== "undefined" ? getSession() : null;
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const myRsvpByTitle = useMemo(() => {
    const map = new Map<string, RsvpStatus>();
    if (!session) return map;
    for (const r of rsvps) if (r.attendeeEmail === session.email) map.set(r.eventTitle, r.status);
    return map;
  }, [rsvps, session]);

  const visible = useMemo(() => {
    if (tab === "Past") return pastEvents;
    if (tab === "RSVP'd") return events.filter((e) => {
      const s = myRsvpByTitle.get(e.title);
      return s === "going" || s === "maybe";
    });
    if (tab === "Saved") return events.filter((e) => savedTitles.includes(e.title));
    return events;
  }, [tab, myRsvpByTitle, savedTitles]);

  useEffect(() => {
    if (!eventSlug) return;
    setTab("All");
    const node = refs.current[eventSlug];
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [eventSlug, loading]);

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

      {visible.length === 0 ? (
        <Panel>
          <EmptyState
            icon={CalendarX2}
            title={EMPTY_COPY[tab].title}
            sub={EMPTY_COPY[tab].sub}
            action={
              tab !== "All" ? (
                <AppButton variant="secondary" size="sm" onClick={() => setTab("All")}>
                  Browse all events
                </AppButton>
              ) : (
                <AppButton asChild variant="secondary" size="sm">
                  <Link to="/student/explore">Explore organizations</Link>
                </AppButton>
              )
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((event) => {
            const slug = slugify(event.title);
            const isHighlighted = eventSlug === slug;
            const isPast = tab === "Past";
            const myStatus = myRsvpByTitle.get(event.title);
            const badgeNode = isPast ? (
              <Badge tone="neutral">Ended</Badge>
            ) : myStatus ? (
              <Badge tone={STATUS_TONE[myStatus]}>{STATUS_LABEL[myStatus]}</Badge>
            ) : (
              <Badge tone={event.status === "Open" ? "success" : event.status === "Soon" ? "info" : "warning"}>{event.status}</Badge>
            );
            return (
              <div
                key={event.title}
                ref={(el) => {
                  refs.current[slug] = el;
                }}
                className={`rounded-3xl transition ${isHighlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                <EventCard
                  event={event}
                  cover={eventCovers[event.title] ?? defaultEventCover}
                  badge={badgeNode}
                  footerAction={
                    isPast ? (
                      <p className="rounded-full bg-secondary px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
                        This event has ended
                      </p>
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <EventCalendar />
    </>
  );
}

function parseDate(date: string) {
  const d = new Date(date);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function EventCalendar() {
  const all = useMemo(
    () => [...pastEvents, ...events].map((e, i) => ({ ...e, ...parseDate(e.date), dot: DOTS[i % DOTS.length] })),
    [],
  );
  // Start on the month of the first upcoming event.
  const first = parseDate(events[0].date);
  const [cursor, setCursor] = useState({ year: first.year, month: first.month });

  const monthEvents = all.filter((e) => e.year === cursor.year && e.month === cursor.month);
  const byDay = new Map(monthEvents.map((e) => [e.day, e]));
  const startWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <Panel className="mt-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Event Calendar</p>
          <h3 className="mt-1 font-display text-xl font-bold">
            {MONTHS[cursor.month]} {cursor.year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <IconButton className="rounded-full" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton className="rounded-full" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px] rounded-[28px] border border-border bg-card/95 p-4 shadow-soft sm:p-5">
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekdayLabels.map((day) => (
              <p key={day} className="pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {day}
              </p>
            ))}

            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="aspect-[0.95]" />;
              const event = byDay.get(cell);
              const content = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${event ? "text-primary" : "text-foreground"}`}>{cell}</span>
                    {event ? <span className={`mt-1 h-2 w-2 rounded-full ${event.dot}`} /> : null}
                  </div>
                  <div className="mt-auto min-h-[2.5rem]">
                    {event ? (
                      <>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-foreground">{event.title}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{event.time}</p>
                      </>
                    ) : null}
                  </div>
                </>
              );
              const base = "group flex aspect-[0.95] flex-col rounded-2xl border p-2.5 text-left transition";
              return event ? (
                <Link
                  key={cell}
                  to="/student/events"
                  search={{ event: slugify(event.title) }}
                  className={`${base} border-primary/15 bg-[color:color-mix(in_oklab,var(--primary)_7%,var(--card))] shadow-soft hover:border-primary/40`}
                >
                  {content}
                </Link>
              ) : (
                <div key={cell} className={`${base} border-transparent bg-card/70`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {monthEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No events scheduled this month.</p>
        ) : (
          monthEvents.map((event) => (
            <div key={event.title} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${event.dot}`} />
              <span className="font-medium text-foreground">{event.title}</span>
              <span>
                {MONTHS[event.month].slice(0, 3)} {event.day} · {event.time}
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
