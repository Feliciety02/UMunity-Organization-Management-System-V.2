import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, Download, Search, Users } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { useRsvps, type RsvpStatus } from "@/lib/rsvp";
import { events } from "@/data/site";

export const Route = createFileRoute("/leader/attendees")({
  component: Attendees,
});

const statusTone: Record<RsvpStatus, "success" | "warning" | "danger"> = {
  going: "success",
  maybe: "warning",
  cancelled: "danger",
};

function Attendees() {
  const rsvps = useRsvps();
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

  const filtered = useMemo(
    () =>
      eventRsvps.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (query && !`${r.attendeeName} ${r.attendeeEmail} ${r.program ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [eventRsvps, query, status],
  );

  const counts = useMemo(() => {
    const going = eventRsvps.filter((r) => r.status === "going").length;
    const maybe = eventRsvps.filter((r) => r.status === "maybe").length;
    const cancelled = eventRsvps.filter((r) => r.status === "cancelled").length;
    return { going, maybe, cancelled, total: eventRsvps.length };
  }, [eventRsvps]);

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Program", "Status", "Updated"],
      ...filtered.map((r) => [r.attendeeName, r.attendeeEmail, r.program ?? "", r.status, new Date(r.updatedAt).toISOString()]),
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

  return (
    <>
      <PageHead
        title="Attendees"
        sub="See who RSVP'd to your events and export the attendee list."
        action={
          <AppButton variant="secondary" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search attendees..."
                  className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
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
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No attendees match" sub="Try a different filter or wait for more RSVPs." icon={Users} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3">Attendee</th>
                      <th>Program</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.attendeeEmail + r.eventTitle} className="hover:bg-secondary/40">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {r.attendeeName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                            </div>
                            <div>
                              <p className="font-semibold">{r.attendeeName}</p>
                              <p className="text-xs text-muted-foreground">{r.attendeeEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-muted-foreground">{r.program ?? "—"}</td>
                        <td>
                          <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                        </td>
                        <td className="text-xs text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
