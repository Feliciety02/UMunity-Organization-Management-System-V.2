import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { Edit3, Trash2, ExternalLink, ClipboardCheck, Plus } from "lucide-react";
import { useEventDocs, computeProgress, deleteEventDoc, type EventDoc } from "@/lib/event-requirements";
import { AppButton } from "@/components/ui/app-button";
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showStatusToast } from "@/lib/feedback";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";

export const Route = createFileRoute("/leader/manage-events")({
  component: ManageEvents,
});

const staticList = [
  { t: "Hack Night Vol. 3", d: "June 02", r: 56, cap: 80, s: "Published" },
  { t: "Tech Talk: AI in Education", d: "June 14", r: 92, cap: 150, s: "Draft" },
  { t: "CS Christmas Mixer", d: "Dec 12", r: 0, cap: 200, s: "Draft" },
  { t: "Year-end Hackathon 2025", d: "Dec 04 (past)", r: 248, cap: 250, s: "Completed" },
];

type EventRow = {
  key: string;
  title: string;
  date: string;
  rsvpValue: string;
  rsvpR: number;
  rsvpCap: number;
  reqText: string;
  reqEventId: string;
  status: string;
  statusTone: "success" | "info" | "warning" | "neutral";
  doc: EventDoc | null;
};

function ManageEvents() {
  const navigate = useNavigate();
  const docs = useEventDocs();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<EventDoc | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EventDoc | null>(null);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(doc: EventDoc) {
    setFormMode("edit");
    setEditing(doc);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const title = pendingDelete.title;
    deleteEventDoc(pendingDelete.id);
    setPendingDelete(null);
    showStatusToast("Event deleted", `${title} and its tracker were removed.`, "info");
  }

  const rows = useMemo<EventRow[]>(() => {
    const result: EventRow[] = [];
    docs.forEach((doc) => {
      const p = computeProgress(doc);
      result.push({
        key: doc.id,
        title: doc.title,
        date: doc.date || "TBA",
        rsvpValue: "—",
        rsvpR: 0,
        rsvpCap: 0,
        reqText: `${p.pct}% · ${p.done}/${p.total}`,
        reqEventId: doc.id,
        status: p.ready ? "Ready" : "In progress",
        statusTone: p.ready ? "success" : "info",
        doc,
      });
    });
    staticList.forEach((e) => {
      result.push({
        key: e.t,
        title: e.t,
        date: e.d,
        rsvpValue: `${e.r}/${e.cap}`,
        rsvpR: e.r,
        rsvpCap: e.cap,
        reqText: "—",
        reqEventId: "",
        status: e.s,
        statusTone: e.s === "Published" ? "success" : e.s === "Draft" ? "warning" : "neutral",
        doc: null,
      });
    });
    return result;
  }, [docs]);

  const columns: Column<EventRow>[] = [
    {
      key: "title",
      label: "Event",
      sortable: true,
      render: (row) => <span className="font-semibold">{row.title}</span>,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (row) => <span className="text-muted-foreground">{row.date}</span>,
    },
    {
      key: "rsvpValue",
      label: "RSVPs",
      sortable: true,
      render: (row) =>
        row.rsvpR > 0 || row.rsvpCap > 0 ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-gold" style={{ width: `${(row.rsvpR / row.rsvpCap) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{row.rsvpValue}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{row.rsvpValue}</span>
        ),
    },
    {
      key: "reqText",
      label: "Requirements",
      render: (row) =>
        row.doc ? (
          <Link
            to="/leader/requirements/$eventId"
            params={{ eventId: row.reqEventId }}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold transition hover:bg-primary/10 hover:text-primary"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> {row.reqText}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">{row.reqText}</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <DataTableStatusBadge status={row.status} tone={row.statusTone} />,
    },
    {
      key: "actions",
      label: "",
      headerClassName: "w-[120px]",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => row.doc && openEdit(row.doc)}
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Edit ${row.title}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => row.doc && navigate({ to: "/leader/requirements/$eventId", params: { eventId: row.reqEventId } })}
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Open ${row.title} tracker`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => row.doc && setPendingDelete(row.doc)}
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-rose-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-500/10"
            aria-label={`Delete ${row.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead
        title="Manage events"
        sub="All events created by your organization."
        action={
          <AppButton variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New event
          </AppButton>
        }
      />

      <Panel>
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.key}
          searchable
          searchPlaceholder="Search events..."
          pageSize={10}
        />
      </Panel>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        doc={editing}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.title ?? "event"}?`}
        description="This removes the event and its requirements tracker, including uploaded drafts and review history. This action cannot be undone."
        confirmLabel="Delete event"
        tone="danger"
        onConfirm={confirmDelete}
      />
    </>
  );
}
