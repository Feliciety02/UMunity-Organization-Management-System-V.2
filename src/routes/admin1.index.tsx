import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { AppButton } from "@/components/ui/app-button";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/admin1/")({
  component: Admin1Dashboard,
});

function Admin1Dashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin1");
  const compliance = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin1");

  return (
    <>
      <WorkflowBoard
        title="Admin 1 final authority queue"
        sub="Approve the workflows that have cleared adviser and Admin 2 review, and keep university records aligned."
        workflows={workflows}
        detailBase="/admin1/workflows"
        emptyTitle="No final approvals pending"
        emptySub="Only fully validated workflows reach this last stage."
      />
      <Panel title="Accreditation decisions" className="mt-6">
        {compliance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No final accreditation decisions are waiting for Admin 1.</p>
        ) : (
          <div className="space-y-3">
            {compliance.slice(0, 3).map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="warning">{submission.academicYear}</Badge>
                  <Badge tone="neutral">{submission.data.accreditationScope}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{submission.orgName}</p>
                <p className="text-xs text-muted-foreground">{submission.data.category} - {submission.data.memberCount} members</p>
              </div>
            ))}
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin1/accreditation">Open accreditation queue</Link>
            </AppButton>
          </div>
        )}
      </Panel>
    </>
  );
}
