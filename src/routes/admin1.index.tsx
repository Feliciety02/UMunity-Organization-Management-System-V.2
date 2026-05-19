import { createFileRoute } from "@tanstack/react-router";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { useWorkflows } from "@/lib/workflows";

export const Route = createFileRoute("/admin1/")({
  component: Admin1Dashboard,
});

function Admin1Dashboard() {
  const workflows = useWorkflows().filter((workflow) => workflow.status === "pending_admin1");

  return (
    <WorkflowBoard
      title="Admin 1 final authority queue"
      sub="Approve the workflows that have cleared adviser and Admin 2 review, and keep university records aligned."
      workflows={workflows}
      detailBase="/admin1/workflows"
      emptyTitle="No final approvals pending"
      emptySub="Only fully validated workflows reach this last stage."
    />
  );
}
