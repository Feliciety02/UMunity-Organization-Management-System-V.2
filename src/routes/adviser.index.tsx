import { createFileRoute } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";

export const Route = createFileRoute("/adviser/")({
  component: AdviserDashboard,
});

function AdviserDashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_adviser");

  return (
    <WorkflowBoard
      title="Adviser approval queue"
      sub="Review event proposals, leave revision comments, and clear organization activities before they reach school administration."
      workflows={workflows}
      detailBase="/adviser/workflows"
      emptyTitle="No adviser approvals pending"
      emptySub="Once leaders submit workflows, they will appear here for first-line review."
    />
  );
}
