import { createFileRoute } from "@tanstack/react-router";
import { EventWorkflowDetail } from "@/components/workflows/EventWorkflowDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useWorkflow } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/workflows/$workflowId")({
  component: LeaderWorkflowDetailPage,
});

function LeaderWorkflowDetailPage() {
  const { workflowId } = Route.useParams();
  const workflow = useWorkflow(workflowId);
  const session = getSession();

  if (!workflow || !session) {
    return (
      <>
        <PageHead title="Workflow not found" sub="The event workflow was removed or does not exist." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the workflow list and choose another event proposal.</p>
        </Panel>
      </>
    );
  }

  return (
    <EventWorkflowDetail
      workflow={workflow}
      viewer={{ role: "leader", name: session.name }}
      backTo="/leader/workflows"
      backLabel="All workflows"
    />
  );
}
