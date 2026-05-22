import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { RequirementsTrackerContent } from "@/components/events/RequirementsTrackerContent";
import { getSession } from "@/lib/auth";
import { useEventDoc } from "@/lib/event-requirements";

export const Route = createFileRoute("/adviser/requirements/$eventId")({
  component: AdviserRequirementsDetailPage,
});

function AdviserRequirementsDetailPage() {
  const { eventId } = Route.useParams();
  const doc = useEventDoc(eventId);
  const session = getSession();

  if (!doc || !session) {
    return (
      <>
        <PageHead title="Requirements not found" sub="The requested tracker is unavailable." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the adviser requirements queue to continue reviewing submissions.</p>
        </Panel>
      </>
    );
  }

  return <RequirementsTrackerContent doc={doc} viewer={{ role: "adviser", name: session.name }} />;
}
