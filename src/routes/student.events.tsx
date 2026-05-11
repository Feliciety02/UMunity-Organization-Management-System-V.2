import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { events } from "@/data/site";
import { Bookmark, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/student/events")({
  component: Events,
});

function Events() {
  const tabs = ["All", "RSVP'd", "Saved", "Past"] as const;
  const [tab, setTab] = useState<typeof tabs[number]>("All");

  return (
    <>
      <PageHead title="Events" sub="Discover, RSVP, and save what's next." />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${tab === t ? "bg-gradient-maroon text-primary-foreground" : "bg-secondary text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e, i) => (
          <div key={e.title} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
            <div className="relative h-24 bg-gradient-maroon">
              <div className="absolute inset-0 bg-hero opacity-50" />
              <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-gold">
                <Bookmark className="h-4 w-4 text-primary-deep" />
              </button>
              <div className="absolute -bottom-4 left-4 rounded-2xl bg-card px-3 py-2 text-center shadow-soft">
                <p className="font-display text-lg font-bold leading-none text-primary">{e.date.split(" ")[1].replace(",", "")}</p>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{e.date.split(" ")[0]}</p>
              </div>
            </div>
            <div className="p-5 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.host}</p>
                <Badge tone={i === 0 ? "success" : i === 1 ? "warning" : "info"}>{i === 0 ? "RSVP'd" : i === 1 ? "Saved" : e.status}</Badge>
              </div>
              <h3 className="mt-2 font-display text-base font-bold">{e.title}</h3>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {e.time}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.venue}</p>
              </div>
              <button className="mt-4 w-full rounded-full bg-gradient-gold py-2 text-xs font-bold text-primary-deep">RSVP</button>
            </div>
          </div>
        ))}
      </div>

      <Panel className="mt-8" title="Calendar (May 2026)">
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S","M","T","W","T","F","S"].map((d) => <p key={d} className="py-1 font-semibold text-muted-foreground">{d}</p>)}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const hot = [24, 30].includes(d);
            return (
              <div key={d} className={`aspect-square rounded-lg p-1.5 text-xs ${hot ? "bg-gradient-maroon font-bold text-primary-foreground" : "bg-secondary/40 text-foreground hover:bg-secondary"}`}>
                <p>{d}</p>
                {hot && <span className="text-[8px] text-gold">●</span>}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
