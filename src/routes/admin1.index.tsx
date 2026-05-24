import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { AppButton } from "@/components/ui/app-button";
import { Badge, MiniBarChart, Panel, StatCard } from "@/components/dashboard/DashboardLayout";
import { useAdminInsights } from "@/lib/admin-insights";
import { CheckCircle2, Landmark, ShieldCheck, UserCog } from "lucide-react";

export const Route = createFileRoute("/admin1/")({
  component: Admin1Dashboard,
});

function Admin1Dashboard() {
  const insights = useAdminInsights("admin1");
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin1");
  const compliance = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin1");

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Authority queue" value={`${insights.queueCount}`} delta="Final approvals awaiting university action" icon={Landmark} tone="gold" />
        <StatCard label="Decisions this month" value={`${insights.monthlyDecisions}`} delta={`Avg ${insights.avgTurnaroundDays.toFixed(1)} days final turnaround`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Accredited orgs" value={`${insights.accreditedOrgs}`} delta="Already cleared in the new workflow system" icon={ShieldCheck} tone="primary" />
        <StatCard label="Archived transitions" value={`${insights.archivedTransitions}`} delta="Officer histories preserved by Admin 1" icon={UserCog} tone="rose" />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Final decision throughput">
          <MiniBarChart data={insights.weeklyDecisions} color="var(--primary)" />
        </Panel>
        <Panel
          title="Final authority view"
          action={
            <AppButton asChild variant="secondary" size="sm">
              <Link to="/admin1/authority">Open full view</Link>
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
      <Panel title="Organization registry" className="mt-6" action={<AppButton asChild variant="secondary" size="sm"><Link to="/admin1/organizations">Open registry</Link></AppButton>}>
        <p className="text-sm text-muted-foreground">
          Final accreditation approval now updates the organization registry automatically. Use the registry to place organizations on probation, return them to review, or disband them with recorded governance history.
        </p>
      </Panel>
    </>
  );
}
