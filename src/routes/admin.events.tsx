import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { events } from "@/data/site";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Eye, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

type Event = (typeof events)[number];

const columns: Column<Event>[] = [
  { key: "title", label: "Event", sortable: true, render: (row) => <span className="font-semibold">{row.title}</span> },
  { key: "host", label: "Host", sortable: true, render: (row) => <span className="text-muted-foreground">{row.host}</span> },
  { key: "date", label: "Date", sortable: true, render: (row) => <>{row.date}</> },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (row) => {
      const i = events.indexOf(row);
      const label = i < 2 ? "Approved" : i < 4 ? "Pending" : "Scheduled";
      return <Badge tone={i < 2 ? "success" : i < 4 ? "warning" : "info"}>{label}</Badge>;
    },
  },
];

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
                <p className="text-xs text-muted-foreground">{e.host} - {e.venue}</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-full bg-gradient-maroon px-3 py-1.5 text-xs font-bold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> Review</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"><X className="h-3.5 w-3.5" /> Reject</button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="All events">
        <DataTable
          columns={columns}
          data={events}
          keyExtractor={(row) => row.title}
          searchable
          searchPlaceholder="Search events..."
          pageSize={10}
        />
      </Panel>
    </>
  );
}
