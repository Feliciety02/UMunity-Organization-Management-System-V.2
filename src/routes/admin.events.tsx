import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { events } from "@/data/site";
import { Eye, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

function AdminEvents() {
  return (
    <>
      <PageHead title="Manage events" sub="Oversee every published, pending, and flagged event." />

      <Panel title="Pending approval" className="mb-6">
        <div className="space-y-3">
          {events.slice(2, 5).map((e) => (
            <div key={e.title} className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-3">
              <div className="rounded-xl bg-gradient-maroon px-3 py-2 text-center text-primary-foreground">
                <p className="font-display text-base font-bold leading-none">{e.date.split(" ")[1].replace(",", "")}</p>
                <p className="text-[9px] uppercase text-gold">{e.date.split(" ")[0]}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.host} · {e.venue}</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-full bg-gradient-maroon px-3 py-1.5 text-xs font-bold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> Review</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"><X className="h-3.5 w-3.5" /> Reject</button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="All events">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Event</th><th>Host</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e, i) => (
                <tr key={e.title} className="hover:bg-secondary/40">
                  <td className="py-3 font-semibold">{e.title}</td>
                  <td className="text-muted-foreground">{e.host}</td>
                  <td>{e.date}</td>
                  <td><Badge tone={i < 2 ? "success" : i < 4 ? "warning" : "info"}>{i < 2 ? "Approved" : i < 4 ? "Pending" : "Scheduled"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
