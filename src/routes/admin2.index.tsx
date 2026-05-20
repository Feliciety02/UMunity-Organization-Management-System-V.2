import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";
import { usePostApprovals } from "@/lib/post-approvals";
import { AppButton } from "@/components/ui/app-button";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/admin2/")({
  component: Admin2Dashboard,
});

function Admin2Dashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin2");
  const postApprovals = usePostApprovals().filter((approval) => approval.status === "pending_admin2");

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
    </>
  );
}
