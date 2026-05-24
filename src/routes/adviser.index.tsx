import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { closeoutStatusTone, formatCloseoutStatus, useWorkflows } from "@/lib/workflows";
import { usePostApprovals } from "@/lib/post-approvals";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { useEventDocs } from "@/lib/event-requirements";
import { AppButton } from "@/components/ui/app-button";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/adviser/")({
  component: AdviserDashboard,
});

function AdviserDashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_adviser");
  const postApprovals = usePostApprovals().filter((approval) => approval.status === "pending_adviser");
  const compliance = useComplianceSubmissions().filter((submission) => submission.status === "pending_adviser");
  const closeoutQueue = useWorkflows().filter(
    (workflow) =>
      (workflow.status === "approved" || workflow.status === "completed") &&
      workflow.operations.postEvent.closeoutStatus === "pending_adviser",
  );
  const requirements = useEventDocs().filter((doc) => doc.reviewStatus === "pending_adviser");

  return (
    <>
      <WorkflowBoard
        title="Adviser approval queue"
        sub="Review event proposals, leave revision comments, and clear organization activities before they reach school administration."
        workflows={workflows}
        detailBase="/adviser/workflows"
        emptyTitle="No adviser approvals pending"
        emptySub="Once leaders submit workflows, they will appear here for first-line review."
      />
      <Panel
        title="Review center"
        className="mt-6"
        action={
          <AppButton asChild variant="secondary" size="sm">
            <Link to="/adviser/review-center">Open full view</Link>
          </AppButton>
        }
      >
        <p className="text-sm text-muted-foreground">
          Keep revision notes, recent reviewer comments, and the active adviser queue visible in one place instead of jumping across individual routes.
        </p>
      </Panel>
      <Panel title="Post approvals" className="mt-6">
        {postApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No post submissions are waiting for adviser review.</p>
        ) : (
          <div className="space-y-3">
            {postApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="info">{approval.type}</Badge>
                  <Badge tone="neutral">{approval.visibility}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{approval.title || "Untitled post"}</p>
                <p className="text-xs text-muted-foreground">{approval.orgName}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/adviser/posts">Open post queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
      <Panel title="Accreditation reviews" className="mt-6">
        {compliance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No organization accreditation reviews are waiting for adviser validation.</p>
        ) : (
          <div className="space-y-3">
            {compliance.slice(0, 3).map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="info">{submission.academicYear}</Badge>
                  <Badge tone="neutral">{submission.data.accreditationScope}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{submission.orgName}</p>
                <p className="text-xs text-muted-foreground">{submission.data.category} - {submission.data.memberCount} members</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/adviser/compliance">Open accreditation queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
      <Panel title="Requirements review" className="mt-6">
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No event requirement trackers are waiting for adviser review.</p>
        ) : (
          <div className="space-y-3">
            {requirements.slice(0, 3).map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="info">{doc.category}</Badge>
                  <Badge tone="neutral">{doc.date}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.venue}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/adviser/requirements">Open requirements queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
      <Panel title="Event closeout reviews" className="mt-6">
        {closeoutQueue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No post-event packets are waiting for adviser review.</p>
        ) : (
          <div className="space-y-3">
            {closeoutQueue.slice(0, 3).map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone={closeoutStatusTone(workflow.operations.postEvent.closeoutStatus)}>
                    {formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus)}
                  </Badge>
                  <Badge tone="neutral">{workflow.orgShort}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{workflow.proposal.title}</p>
                <p className="text-xs text-muted-foreground">{workflow.orgName}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/adviser">Open workflow queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
    </>
  );
}
