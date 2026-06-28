import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, Download, Users } from "lucide-react";
import { PageHead, Panel, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { useDashboardPageLoading } from "@/lib/feedback";
import { useRsvps, type RsvpStatus } from "@/lib/rsvp";
import { events } from "@/data/site";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";

export const Route = createFileRoute("/leader/attendees")({
  component: Attendees,
});

type AttendeeRow = {
  key: string;
  name: string;
  email: string;
  initials: string;
  program: string;
  status: RsvpStatus;
  updated: string;
};

const columns: Column<AttendeeRow>[] = [
  {
    key: "name",
    label: "Attendee",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {row.initials}
        </div>
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "program",
    label: "Program",
    sortable: true,
    render: (row) => <span className="text-muted-foreground">{row.program || "—"}</span>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => <DataTableStatusBadge status={row.status} />,
  },
  {
    key: "updated",
    label: "Updated",
    sortable: true,
    render: (row) => <span className="text-xs text-muted-foreground">{row.updated}</span>,
  },
];

function Attendees() {
  const rsvps = useRsvps();
  const loading = useDashboardPageLoading();
  const eventTitles = useMemo(() => {
    const set = new Set<string>(events.map((e) => e.title));
    rsvps.forEach((r) => set.add(r.eventTitle));
    return Array.from(set);
  }, [rsvps]);

  const [selected, setSelected] = useState<string>(eventTitles[0] ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RsvpStatus>("all");

  const eventRsvps = useMemo(
    () => rsvps.filter((r) => r.eventTitle === selected),
    [rsvps, selected],
  );

  const statusFiltered = useMemo(
    () => (status === "all" ? eventRsvps : eventRsvps.filter((r) => r.status === status)),
    [eventRsvps, status],
  );

  const counts = useMemo(() => {
    const going = eventRsvps.filter((r) => r.status === "going").length;
    const maybe = eventRsvps.filter((r) => r.status === "maybe").length;
    const cancelled = eventRsvps.filter((r) => r.status === "cancelled").length;
    return { going, maybe, cancelled, total: eventRsvps.length };
  }, [eventRsvps]);

  if (loading) {
    return (
      <>
        <PageHead title="Attendees" sub="Loading your latest RSVP activity." />
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <PanelSkeleton rows={5} className="h-fit" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <PanelSkeleton key={index} rows={2} />
              ))}
            </div>
            <PanelSkeleton rows={6} />
          </div>
        </div>
      </>
    );
  }

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Program", "Status", "Updated"],
      ...statusFiltered.map((r) => [r.attendeeName, r.attendeeEmail, r.program ?? "", r.status, new Date(r.updatedAt).toISOString()]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.replaceAll(" ", "-")}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rows: AttendeeRow[] = useMemo(() => statusFiltered.map((r) => ({
    key: r.attendeeEmail + r.eventTitle,
    name: r.attendeeName,
    email: r.attendeeEmail,
    initials: r.attendeeName.split(" ").slice(0, 2).map((w) => w[0]).join(""),
    program: r.program ?? "—",
    status: r.status,
    updated: new Date(r.updatedAt).toLocaleDateString(),
  })), [statusFiltered]);

  return (
    <>
      <PageHead
        title="Attendees"
        sub="See who RSVP'd to your events and export the attendee list."
        action={
          <AppButton variant="secondary" size="sm" onClick={exportCsv} disabled={statusFiltered.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </AppButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Panel className="h-fit p-2">
          <div className="space-y-1">
            {eventTitles.map((title) => {
              const c = rsvps.filter((r) => r.eventTitle === title && r.status === "going").length;
              const active = selected === title;
              return (
                <button
                  key={title}
                  onClick={() => setSelected(title)}
                  className={`flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2 text-left transition ${
                    active ? "bg-[color:color-mix(in_oklab,var(--primary)_8%,white)] text-primary" : "text-foreground/85 hover:bg-secondary"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {events.find((e) => e.title === title)?.date ?? "—"}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">{c}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={counts.total} />
            <Stat label="Going" value={counts.going} tone="emerald" />
            <Stat label="Maybe" value={counts.maybe} tone="amber" />
            <Stat label="Cancelled" value={counts.cancelled} tone="rose" />
          </div>

          <Panel>
            <DataTable
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.key}
              searchable
              searchQuery={query}
              onSearchChange={setQuery}
              searchPlaceholder="Search attendees..."
              filters={
                <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 text-xs">
                  {(["all", "going", "maybe", "cancelled"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`rounded-full px-3 py-1.5 font-semibold capitalize transition ${
                        status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              }
              emptyTitle="No attendees match"
              emptySub="Try a different filter or open your events to publish or promote one."
              emptyIcon={
                <div className="flex flex-col items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <AppButton asChild variant="secondary" size="sm">
                    <Link to="/leader/manage-events">Open events</Link>
                  </AppButton>
                </div>
              }
            />
          </Panel>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "emerald" | "amber" | "rose" }) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-display text-2xl font-bold">{value}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>RSVPs</span>
      </div>
    </div>
  );
}
