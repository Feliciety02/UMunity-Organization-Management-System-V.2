import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { WorkflowBoard } from "@/components/workflows/WorkflowBoard";
import { AppButton } from "@/components/ui/app-button";
import { useWorkflows } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/workflows")({
  component: LeaderWorkflows,
});

function LeaderWorkflows() {
  const session = getSession();
  const orgName = session?.org;
  const workflows = useWorkflows().filter((workflow) => !orgName || workflow.orgName === orgName);

  return (
    <WorkflowBoard
      title="Event workflows"
      sub="Structured approvals replace document-heavy event submissions. Draft, submit, revise, and track each proposal in one place."
      workflows={workflows}
      detailBase="/leader/workflows"
      emptyTitle="No event workflows yet"
      emptySub="Start a new event proposal to build the smart workflow, approval timeline, and review history."
      emptyAction={
        <AppButton asChild variant="primary">
          <Link to="/leader/create-event">Create event workflow</Link>
        </AppButton>
      }
      action={
        <AppButton asChild variant="primary">
          <Link to="/leader/create-event">
            <Plus className="h-4 w-4" /> New workflow
          </Link>
        </AppButton>
      }
    />
  );
}
