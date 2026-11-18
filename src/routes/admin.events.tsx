import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, CheckCircle2, X } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { events } from "@/data/site";
import { decideEvent, eventReviewStatus, useEventDecisions } from "@/lib/admin-queues";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

type Event = (typeof events)[number];

function AdminEvents() {
  const decisions = useEventDecisions();
  const [rejecting, setRejecting] = useState<Event | null>(null);
  const pending = events.filter((e) => eventReviewStatus(e.title, decisions) === "Pending");

  const columns: Column<Event>[] = [
    { key: "title", label: "Event", sortable: true, render: (row) => <span className="font-semibold">{row.title}</span> },
    { key: "host", label: "Host", sortable: true, render: (row) => <span className="text-muted-foreground">{row.host}</span> },
    { key: "date", label: "Date", sortable: true, render: (row) => <>{row.date}</> },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = eventReviewStatus(row.title, decisions);
        return <Badge tone={status === "Approved" ? "success" : status === "Rejected" ? "danger" : "warning"}>{status}</Badge>;
      },
    },
  ];

  return (
    <>
      <PageHead title="Manage events" sub={`Oversee every published and pending event. ${pending.length} awaiting approval.`} />

      <Panel title="Pending approval" className="mb-6">
        {pending.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No events waiting" sub="Newly submitted events will appear here for approval." />
        ) : (
          <div className="space-y-3">
            {pending.map((e) => (
              <div key={e.title} className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-3">
                <div className="rounded-xl bg-primary px-3 py-2 text-center text-primary-foreground">
                  <p className="font-display text-base font-bold leading-none">{e.date.split(" ")[1].replace(",", "")}</p>
                  <p className="text-[9px] uppercase">{e.date.split(" ")[0].slice(0, 3)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.host} · {e.venue} · {e.time}</p>
                </div>
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    decideEvent(e.title, "Approved");
                    showStatusToast("Event approved", `${e.title} is now published.`);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  className="border border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setRejecting(e)}
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="All events">
        <DataTable columns={columns} data={events} keyExtractor={(row) => row.title} searchable searchPlaceholder="Search events..." pageSize={10} />
      </Panel>

      <ConfirmDialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
        title={`Reject ${rejecting?.title ?? "event"}?`}
        description="The hosting organization will be notified and can revise and resubmit."
        confirmLabel="Reject event"
        tone="danger"
        onConfirm={() => {
          if (!rejecting) return;
          decideEvent(rejecting.title, "Rejected");
          showStatusToast("Event rejected", `${rejecting.host} has been notified.`, "warning");
          setRejecting(null);
        }}
      />
    </>
  );
}
