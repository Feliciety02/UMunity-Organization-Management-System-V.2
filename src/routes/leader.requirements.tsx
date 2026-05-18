import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ClipboardCheck, Plus, ArrowRight, CalendarDays } from "lucide-react";
import { useEventDocs, computeProgress } from "@/lib/event-requirements";

export const Route = createFileRoute("/leader/requirements")({
  component: RequirementsHub,
});

function RequirementsHub() {
  const docs = useEventDocs();

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
            return (
              <Panel key={doc.id} className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="info">{doc.category || "Event"}</Badge>
                    {p.ready ? <Badge tone="success">Ready for Submission</Badge> : null}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{doc.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {doc.date || "TBA"}{doc.time ? ` · ${doc.time}` : ""} · {doc.venue || "Venue TBA"}
                  </p>
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

                <AppButton asChild variant="secondary" className="mt-auto">
                  <Link to="/leader/requirements/$eventId" params={{ eventId: doc.id }}>
                    Open tracker <ArrowRight className="h-4 w-4" />
                  </Link>
                </AppButton>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
