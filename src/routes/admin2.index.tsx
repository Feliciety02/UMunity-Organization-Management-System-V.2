import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { closeoutStatusTone, formatCloseoutStatus, useWorkflows } from "@/lib/workflows";
import { usePostApprovals } from "@/lib/post-approvals";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { AppButton } from "@/components/ui/app-button";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/admin2/")({
  component: Admin2Dashboard,
});

function Admin2Dashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin2");
  const postApprovals = usePostApprovals().filter((approval) => approval.status === "pending_admin2");
  const compliance = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin2");
  const closeoutQueue = useWorkflows().filter(
    (workflow) =>
      (workflow.status === "approved" || workflow.status === "completed") &&
      workflow.operations.postEvent.closeoutStatus === "pending_admin2",
  );

  return (
    <>
      <WorkflowBoard
        title="Admin 2 compliance queue"
        sub="Validate adviser-cleared submissions, monitor compliance, and escalate only the ready workflows."
        workflows={workflows}
        detailBase="/admin2/workflows"
        emptyTitle="No Admin 2 reviews pending"
        emptySub="Adviser-approved workflows will appear here for secondary administrative validation."
      />
      <Panel title="Post publishing queue" className="mt-6">
        {postApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adviser-approved posts are waiting for publishing.</p>
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
              <Link to="/admin2/posts">Open post queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
      <Panel title="Accreditation compliance queue" className="mt-6">
        {compliance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adviser-cleared accreditation records are waiting for Admin 2 review.</p>
        ) : (
          <div className="space-y-3">
            {compliance.slice(0, 3).map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="warning">{submission.academicYear}</Badge>
                  <Badge tone="neutral">{submission.data.accreditationScope}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{submission.orgName}</p>
                <p className="text-xs text-muted-foreground">{submission.data.category} - {submission.data.adviserName}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin2/compliance">Open compliance queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
      <Panel title="Event closeout approval queue" className="mt-6">
        {closeoutQueue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adviser-cleared post-event packets are waiting for Admin 2.</p>
        ) : (
          <div className="space-y-3">
            {closeoutQueue.slice(0, 3).map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone={closeoutStatusTone(workflow.operations.postEvent.closeoutStatus)}>
                    {formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus)}
                  </Badge>
                  <Badge tone="neutral">{workflow.proposal.category}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{workflow.proposal.title}</p>
                <p className="text-xs text-muted-foreground">{workflow.orgName}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin2">Open workflow queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
    </>
  );
}
