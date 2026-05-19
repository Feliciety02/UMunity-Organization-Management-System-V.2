import { createFileRoute } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";

export const Route = createFileRoute("/admin2/")({
  component: Admin2Dashboard,
});

function Admin2Dashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin2");

  return (
    <WorkflowBoard
      title="Admin 2 compliance queue"
      sub="Validate adviser-cleared submissions, monitor compliance, and escalate only the ready workflows."
      workflows={workflows}
      detailBase="/admin2/workflows"
      emptyTitle="No Admin 2 reviews pending"
      emptySub="Adviser-approved workflows will appear here for secondary administrative validation."
    />
  );
}
