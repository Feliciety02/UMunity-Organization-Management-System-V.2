import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { RequirementsTrackerContent } from "@/components/events/RequirementsTrackerContent";
import { getSession } from "@/lib/auth";
import { useEventDoc } from "@/lib/event-requirements";

export const Route = createFileRoute("/admin2/requirements/$eventId")({
  component: Admin2RequirementsDetailPage,
});

function Admin2RequirementsDetailPage() {
  const { eventId } = Route.useParams();
  const doc = useEventDoc(eventId);
  const session = getSession();

  if (!doc || !session) {
    return (
      <>
        <PageHead title="Requirements not found" sub="The requested compliance tracker is unavailable." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the Admin 2 requirements queue to continue reviewing submissions.</p>
        </Panel>
      </>
    );
  }

  return <RequirementsTrackerContent doc={doc} viewer={{ role: "admin2", name: session.name }} />;
}
