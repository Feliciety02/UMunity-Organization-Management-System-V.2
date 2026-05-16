import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EventCard } from "@/routes/index";
import { events } from "@/data/site";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — UMunity" },
      { name: "description", content: "RSVP to upcoming University of Mindanao student organization events." },
      { property: "og:title", content: "Events — UMunity" },
      { property: "og:description", content: "RSVP to upcoming University of Mindanao student organization events." },
    ],
  }),
  component: Events,
});

function Events() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-maroon py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold md:text-6xl">
            Campus <span className="text-gradient-gold">Events</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Every summit, run, competition, and celebration — one calendar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e.title} {...e} />)}
        </div>
      </section>
    </PageShell>
  );
}
