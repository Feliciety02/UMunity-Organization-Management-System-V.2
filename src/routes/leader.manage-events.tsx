import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Edit3, Trash2, ExternalLink, ClipboardCheck, Plus } from "lucide-react";
import { useEventDocs, computeProgress, deleteEventDoc, type EventDoc } from "@/lib/event-requirements";
import { AppButton } from "@/components/ui/app-button";
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/leader/manage-events")({
  component: ManageEvents,
});

const staticList = [
  { t: "Hack Night Vol. 3", d: "June 02", r: 56, cap: 80, s: "Published" },
  { t: "Tech Talk: AI in Education", d: "June 14", r: 92, cap: 150, s: "Draft" },
  { t: "CS Christmas Mixer", d: "Dec 12", r: 0, cap: 200, s: "Draft" },
  { t: "Year-end Hackathon 2025", d: "Dec 04 (past)", r: 248, cap: 250, s: "Completed" },
];

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Event</th><th>Date</th><th>RSVPs</th><th>Requirements</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.map((doc) => {
                const p = computeProgress(doc);
                return (
                  <tr key={doc.id} className="transition hover:bg-secondary/40">
                    <td className="py-3 font-semibold">{doc.title}</td>
                    <td className="text-muted-foreground">{doc.date || "TBA"}</td>
                    <td>
                      <span className="text-xs text-muted-foreground">—</span>
                    </td>
                    <td>
                      <Link to="/leader/requirements/$eventId" params={{ eventId: doc.id }} className="inline-flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold transition hover:bg-primary/10 hover:text-primary">
                        <ClipboardCheck className="h-3.5 w-3.5" /> {p.pct}% · {p.done}/{p.total}
                      </Link>
                    </td>
                    <td>
                      <Badge tone={p.ready ? "success" : "info"}>{p.ready ? "Ready" : "In progress"}</Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(doc)}
                          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Edit ${doc.title}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/leader/requirements/$eventId", params: { eventId: doc.id } })}
                          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Open ${doc.title} tracker`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(doc)}
                          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-rose-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-500/10"
                          aria-label={`Delete ${doc.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {staticList.map((e) => (
                <tr key={e.t} className="transition hover:bg-secondary/40">
                  <td className="py-3 font-semibold">{e.t}</td>
                  <td className="text-muted-foreground">{e.d}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gradient-gold" style={{ width: `${(e.r / e.cap) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.r}/{e.cap}</span>
                    </div>
                  </td>
                  <td><span className="text-xs text-muted-foreground">—</span></td>
                  <td><Badge tone={e.s === "Published" ? "success" : e.s === "Draft" ? "warning" : "neutral"}>{e.s}</Badge></td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary" aria-label={`Edit ${e.t}`}><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary" aria-label={`Open ${e.t}`}><ExternalLink className="h-3.5 w-3.5" /></button>
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label={`Delete ${e.t}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
