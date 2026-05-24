import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { closeoutStatusTone, formatCloseoutStatus, useWorkflows } from "@/lib/workflows";
import { usePostApprovals } from "@/lib/post-approvals";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { useEventDocs } from "@/lib/event-requirements";
import { AppButton } from "@/components/ui/app-button";
import { Badge, MiniBarChart, Panel, StatCard } from "@/components/dashboard/DashboardLayout";
import { useAdminInsights } from "@/lib/admin-insights";
import { Activity, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin2/")({
  component: Admin2Dashboard,
});

function Admin2Dashboard() {
  const insights = useAdminInsights("admin2");
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin2");
  const postApprovals = usePostApprovals().filter((approval) => approval.status === "pending_admin2");
  const compliance = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin2");
  const closeoutQueue = useWorkflows().filter(
    (workflow) =>
      (workflow.status === "approved" || workflow.status === "completed") &&
      workflow.operations.postEvent.closeoutStatus === "pending_admin2",
  );
  const requirements = useEventDocs().filter((doc) => doc.reviewStatus === "pending_admin2");

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Queue now" value={`${insights.queueCount}`} delta="Secondary review across all workflow lanes" icon={Clock3} tone="gold" />
        <StatCard label="Escalated onward" value={`${insights.escalatedCount}`} delta="Items already cleared for final authority" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Revision load" value={`${insights.revisionLoad}`} delta={`Avg ${insights.avgTurnaroundDays.toFixed(1)} days validation time`} icon={ShieldAlert} tone="rose" />
        <StatCard label="Monthly decisions" value={`${insights.monthlyDecisions}`} delta="Admin 2 approvals and publishes" icon={Activity} tone="primary" />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Validation throughput">
          <MiniBarChart data={insights.weeklyDecisions} color="var(--primary)" />
        </Panel>
        <Panel
          title="Monitoring"
          action={
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin2/monitoring">Open full view</Link>
            </AppButton>
          }
        >
          <div className="space-y-3">
            {insights.queueItems.slice(0, 3).map((item) => (
              <Link key={item.id} to={item.href as string} className="block rounded-2xl bg-secondary/35 p-3 transition hover:bg-secondary/55">
                <div className="flex items-center gap-2">
                  <Badge tone={item.tone}>{item.status}</Badge>
                  <Badge tone="neutral">{item.lane}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.orgName} - {item.ageHours}h waiting</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
      <Panel
        title="Review center"
        className="mb-6"
        action={
          <AppButton asChild variant="secondary" size="sm">
            <Link to="/admin2/review-center">Open feedback view</Link>
          </AppButton>
        }
      >
        <p className="text-sm text-muted-foreground">
          Use the review center to see Admin 2 validation notes and pending review context across compliance, publishing, closeout, and workflow lanes.
        </p>
      </Panel>
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
      <Panel title="Requirements compliance queue" className="mt-6">
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adviser-cleared requirements trackers are waiting for Admin 2.</p>
        ) : (
          <div className="space-y-3">
            {requirements.slice(0, 3).map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="warning">{doc.category}</Badge>
                  <Badge tone="neutral">{doc.date}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.venue}</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin2/requirements">Open requirements queue</Link>
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
