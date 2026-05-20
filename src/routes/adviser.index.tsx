import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";
import { usePostApprovals } from "@/lib/post-approvals";
import { AppButton } from "@/components/ui/app-button";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/adviser/")({
  component: AdviserDashboard,
});

function AdviserDashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_adviser");
  const postApprovals = usePostApprovals().filter((approval) => approval.status === "pending_adviser");

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
    </>
  );
}
