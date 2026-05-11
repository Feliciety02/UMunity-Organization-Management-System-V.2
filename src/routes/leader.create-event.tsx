import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { Calendar, MapPin, Clock, Users, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/leader/create-event")({
  component: CreateEvent,
});

function CreateEvent() {
  return (
    <>
      <PageHead title="Create event" sub="Plan, publish, and open RSVPs in minutes." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="space-y-4">
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event title</span><input placeholder="e.g. Innovation Summit 2026" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span><textarea rows={4} placeholder="What's the event about?" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Calendar className="h-3 w-3" /> Date</span><input type="date" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm" /></label>
              <label className="block"><span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" /> Time</span><input type="time" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm" /></label>
              <label className="block"><span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><MapPin className="h-3 w-3" /> Venue</span><input placeholder="DPT Building Auditorium" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm" /></label>
              <label className="block"><span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Users className="h-3 w-3" /> Capacity</span><input type="number" placeholder="300" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm" /></label>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" /> Click to upload event banner (PNG/JPG, ≤ 4MB)
            </label>
          </div>
        </Panel>

        <Panel title="Settings">
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between"><span>Open RSVP</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" /></label>
            <label className="flex items-center justify-between"><span>Member-only</span><input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /></label>
            <label className="flex items-center justify-between"><span>Require approval</span><input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /></label>
            <label className="flex items-center justify-between"><span>Auto-remind 24h prior</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" /></label>
          </div>
          <div className="mt-6 space-y-2">
            <button className="w-full rounded-full bg-gradient-maroon py-2.5 text-xs font-bold text-primary-foreground">Publish event</button>
            <button className="w-full rounded-full border border-border bg-card py-2.5 text-xs font-semibold">Save as draft</button>
          </div>
        </Panel>
      </div>
    </>
  );
}
