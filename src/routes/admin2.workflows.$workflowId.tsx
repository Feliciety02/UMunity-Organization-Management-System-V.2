import { createFileRoute } from "@tanstack/react-router";
import { EventWorkflowDetail } from "@/components/workflows/EventWorkflowDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { useWorkflow } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin2/workflows/$workflowId")({
  component: Admin2WorkflowDetailPage,
});

function Admin2WorkflowDetailPage() {
  const { workflowId } = Route.useParams();
  const workflow = useWorkflow(workflowId);
  const session = getSession();

  if (!workflow || !session) {
    return (
      <>
        <PageHead title="Workflow not found" sub="The requested compliance item is unavailable." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the Admin 2 queue to continue secondary review.</p>
        </Panel>
      </>
    );
  }

  return (
    <EventWorkflowDetail
      workflow={workflow}
      viewer={{ role: "admin2", name: session.name }}
      backTo="/admin2"
      backLabel="Admin 2 queue"
    />
  );
}
