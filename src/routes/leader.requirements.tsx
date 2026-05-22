import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ClipboardCheck, Plus, ArrowRight, CalendarDays } from "lucide-react";
import { useEventDocs, computeProgress } from "@/lib/event-requirements";
import { RequirementsTrackerContent } from "@/components/events/RequirementsTrackerContent";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/requirements")({
  component: RequirementsHub,
});

function RequirementsHub() {
  const session = getSession();
  const docs = useEventDocs();
  const [selectedDocId, setSelectedDocId] = useState("");

  useEffect(() => {
    if (!docs.length) {
      setSelectedDocId("");
      return;
    }
    setSelectedDocId((current) => (current && docs.some((doc) => doc.id === current) ? current : docs[0].id));
  }, [docs]);

  const selectedDoc = docs.find((doc) => doc.id === selectedDocId) ?? null;

  return (
    <>
      <PageHead
        title="Event Requirements"
        sub="A smart organizer for OSA paperwork before, during, and after every event. UMUnity does not replace official submissions."
        action={
          <AppButton asChild variant="primary">
            <Link to="/leader/create-event">
              <Plus className="h-4 w-4" /> New event
            </Link>
          </AppButton>
        }
      />

      {docs.length === 0 ? (
        <Panel>
          <div className="grid place-items-center gap-3 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">No event trackers yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Create an event to auto-generate its Requirements Tracker with templates, deadlines, and status pills.
            </p>
            <AppButton asChild variant="primary">
              <Link to="/leader/create-event">Create your first event</Link>
            </AppButton>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc) => {
            const p = computeProgress(doc);
            const previewItems = doc.sections
              .flatMap((section) =>
                section.items.map((item) => ({
                  id: item.id,
                  title: item.title,
                  status: item.status,
                  sectionTitle: section.title,
                })),
              )
              .slice(0, 3);

            return (
              <Panel key={doc.id} className={`flex flex-col gap-4 transition ${selectedDocId === doc.id ? "ring-2 ring-primary/25" : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="info">{doc.category || "Event"}</Badge>
                    {p.ready ? <Badge tone="success">Ready for Submission</Badge> : null}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{doc.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {doc.date || "TBA"}{doc.time ? ` - ${doc.time}` : ""} - {doc.venue || "Venue TBA"}
                  </p>
                </div>

                <div className="space-y-2 rounded-2xl bg-secondary/35 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tracker preview</p>
                  {previewItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.title}</p>
                        <p className="truncate text-muted-foreground">{item.sectionTitle}</p>
                      </div>
                      <Badge tone={item.status === "approved" ? "success" : item.status === "for-review" ? "info" : item.status === "missing" ? "danger" : "neutral"}>
                        {item.status === "for-review" ? "For review" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.done}/{p.total} requirements approved</span>
                    <span className="font-semibold text-foreground">{p.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${p.ready ? "bg-emerald-500" : "bg-gradient-gold"}`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                      selectedDocId === doc.id
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    View here
                  </button>
                  <AppButton asChild variant="secondary" className="flex-1">
                    <Link to="/leader/requirements/$eventId" params={{ eventId: doc.id }}>
                      Open tracker <ArrowRight className="h-4 w-4" />
                    </Link>
                  </AppButton>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {selectedDoc && session ? (
        <div className="mt-8">
          <PageHead
            title={`${selectedDoc.title} tracker`}
            sub="Live tracker inside the leader dashboard. Use the full-page view if you need a dedicated route."
          />
          <RequirementsTrackerContent doc={selectedDoc} viewer={{ role: "leader", name: session.name }} />
        </div>
      ) : null}
    </>
  );
}
