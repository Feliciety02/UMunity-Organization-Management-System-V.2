import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { PageHead, Panel, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { RsvpButton } from "@/components/events/rsvp-button";
import { events } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";
import { slugify, useRsvps } from "@/lib/rsvp";

export const Route = createFileRoute("/student/top-events")({
  component: TopEvents,
});

function TopEvents() {
  const loading = useDashboardPageLoading();
  const rsvps = useRsvps();

  const ranked = useMemo(() => {
    const interest = new Map<string, number>();
    for (const r of rsvps) {
      if (r.status === "cancelled") continue;
      interest.set(r.eventTitle, (interest.get(r.eventTitle) ?? 0) + (r.status === "going" ? 1 : 0.5));
    }
    return events
      .map((e) => ({ ...e, interest: interest.get(e.title) ?? 0 }))
      .sort((a, b) => b.interest - a.interest || a.title.localeCompare(b.title));
  }, [rsvps]);

  if (loading) {
    return (
      <>
        <PageHead title="Top Events" sub="Ranking campus events." />
        <PanelSkeleton rows={6} />
      </>
    );
  }

  return (
    <>
      <PageHead title="Top Events" sub="Campus events with the strongest student interest, ranked by RSVPs." />
      <Panel>
        {ranked.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" sub="Published events will be ranked here." />
        ) : (
          <ol className="divide-y divide-border">
            {ranked.map((e, i) => (
              <li key={e.title} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${
                    i < 3 ? "bg-gold/25 text-primary-deep" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.host}</p>
                  <Link
                    to="/student/events"
                    search={{ event: slugify(e.title) }}
                    className="font-semibold hover:underline"
                  >
                    {e.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {e.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.venue}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {Math.ceil(e.interest)} interested
                    </span>
                  </div>
                </div>
                <div className="w-full sm:w-44">
                  <RsvpButton eventTitle={e.title} size="sm" />
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
