import { createFileRoute } from "@tanstack/react-router";
import { EventWorkflowDetail } from "@/components/workflows/EventWorkflowDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useWorkflow } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/adviser/workflows/$workflowId")({
  component: AdviserWorkflowDetailPage,
});

function AdviserWorkflowDetailPage() {
  const { workflowId } = Route.useParams();
  const workflow = useWorkflow(workflowId);
  const session = getSession();

  if (!workflow || !session) {
    return (
      <>
        <PageHead title="Workflow not found" sub="The requested proposal is unavailable." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the adviser queue to continue reviewing active submissions.</p>
        </Panel>
      </>
    );
  }

  return (
    <EventWorkflowDetail
      workflow={workflow}
      viewer={{ role: "adviser", name: session.name }}
      backTo="/adviser"
      backLabel="Adviser queue"
    />
  );
}
