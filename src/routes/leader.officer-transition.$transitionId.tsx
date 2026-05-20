import { createFileRoute } from "@tanstack/react-router";
import { OfficerTransitionDetail } from "@/components/workflows/OfficerTransitionDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { useTransitionWorkflow } from "@/lib/workflows";

export const Route = createFileRoute("/leader/officer-transition/$transitionId")({
  component: LeaderTransitionDetailPage,
});

function LeaderTransitionDetailPage() {
  const { transitionId } = Route.useParams();
  const workflow = useTransitionWorkflow(transitionId);
  const session = getSession();

  if (!workflow || !session) {
    return (
      <>
        <PageHead title="Transition not found" sub="The officer transition request could not be found." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the officer transition page and try again.</p>
        </Panel>
      </>
    );
  }

  return (
    <OfficerTransitionDetail
      workflow={workflow}
      viewer={{ role: "leader", name: session.name }}
      backTo="/leader/officer-transition"
      backLabel="All transitions"
    />
  );
}
