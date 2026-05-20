import { createFileRoute, Link } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useTransitionWorkflows } from "@/lib/workflows";
import { ArrowRight, UserCog } from "lucide-react";

export const Route = createFileRoute("/adviser/transitions")({
  component: AdviserTransitionsPage,
});

function AdviserTransitionsPage() {
  const workflows = useTransitionWorkflows().filter((workflow) => workflow.status === "pending_adviser");

  return (
    <>
      <PageHead title="Officer transition queue" sub="Validate next academic year officer slates before they reach Admin 1." />
      <Panel>
        {workflows.length === 0 ? (
          <EmptyState title="No officer transitions pending" sub="New nomination sets will appear here after leaders submit them." icon={UserCog} />
        ) : (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="gold">AY {workflow.academicYear}</Badge>
                  <Badge tone="info">{workflow.nominees.length} nominees</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{workflow.orgName}</p>
                <p className="text-xs text-muted-foreground">{workflow.rationale}</p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/adviser/transitions/$transitionId" params={{ transitionId: workflow.id }}>
                    Review transition <ArrowRight className="h-4 w-4" />
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
