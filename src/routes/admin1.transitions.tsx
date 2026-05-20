import { createFileRoute, Link } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useTransitionWorkflows } from "@/lib/workflows";
import { Archive, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin1/transitions")({
  component: Admin1TransitionsPage,
});

function Admin1TransitionsPage() {
  const workflows = useTransitionWorkflows().filter((workflow) => workflow.status === "pending_admin1" || workflow.status === "completed");

  return (
    <>
      <PageHead title="Officer transitions" sub="Final approval and archive management for yearly officer changes." />
      <Panel>
        {workflows.length === 0 ? (
          <EmptyState title="No transition reviews ready" sub="Adviser-validated transitions will appear here for Admin 1." icon={Archive} />
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="gold">AY {workflow.academicYear}</Badge>
                  <Badge tone={workflow.status === "completed" ? "success" : "warning"}>
                    {workflow.status === "completed" ? "Archived" : "Pending final approval"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{workflow.orgName}</p>
                <p className="text-xs text-muted-foreground">{workflow.nominees.length} nominees - adviser {workflow.adviserName}</p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/admin1/transitions/$transitionId" params={{ transitionId: workflow.id }}>
                    Open transition <ArrowRight className="h-4 w-4" />
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
