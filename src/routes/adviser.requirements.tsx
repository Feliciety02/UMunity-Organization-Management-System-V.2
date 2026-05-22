import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { formatReqReviewStatus, reqReviewTone, useEventDocs } from "@/lib/event-requirements";

export const Route = createFileRoute("/adviser/requirements")({
  component: AdviserRequirementsPage,
});

function AdviserRequirementsPage() {
  const docs = useEventDocs().filter((doc) => doc.reviewStatus === "pending_adviser");

  return (
    <>
      <PageHead title="Requirements review" sub="Review officer-submitted event requirement trackers before they move to Admin 2." />
      <Panel>
        {docs.length === 0 ? (
          <EmptyState title="No requirements trackers pending" sub="Leader-submitted requirement packets will appear here first." icon={ClipboardCheck} />
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={reqReviewTone(doc.reviewStatus)}>{formatReqReviewStatus(doc.reviewStatus)}</Badge>
                  <Badge tone="neutral">{doc.category}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{doc.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{doc.date} - {doc.venue}</p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/adviser/requirements/$eventId" params={{ eventId: doc.id }}>
                    Review tracker <ArrowRight className="h-4 w-4" />
                  </Link>
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
