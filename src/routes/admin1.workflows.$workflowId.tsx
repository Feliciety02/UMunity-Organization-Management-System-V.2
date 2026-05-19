import { createFileRoute } from "@tanstack/react-router";
import { EventWorkflowDetail } from "@/components/workflows/EventWorkflowDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useWorkflow } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin1/workflows/$workflowId")({
  component: Admin1WorkflowDetailPage,
});

function Admin1WorkflowDetailPage() {
  const { workflowId } = Route.useParams();
  const workflow = useWorkflow(workflowId);
  const session = getSession();

  if (!workflow || !session) {
    return (
      <>
        <PageHead title="Workflow not found" sub="The requested final authority review item is unavailable." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the Admin 1 queue to continue reviewing active workflows.</p>
        </Panel>
      </>
    );
  }

  return (
    <EventWorkflowDetail
      workflow={workflow}
      viewer={{ role: "admin1", name: session.name }}
      backTo="/admin1"
      backLabel="Admin 1 queue"
    />
  );
}
