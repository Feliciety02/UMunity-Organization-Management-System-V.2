import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEventDoc, deleteEventDoc } from "@/lib/event-requirements";
import { RequirementsTrackerContent } from "@/components/events/RequirementsTrackerContent";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/requirements/$eventId")({
  component: RequirementsTracker,
});

function RequirementsTracker() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const doc = useEventDoc(eventId);
  const session = getSession();

  if (!doc || !session) {
    return (
      <>
        <PageHead title="Requirements" sub="Event not found." />
        <Panel>
          <div className="grid place-items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">This event tracker doesn't exist or has been removed.</p>
            <AppButton asChild variant="secondary">
              <Link to="/leader/requirements"><ArrowLeft className="h-4 w-4" /> Back to trackers</Link>
            </AppButton>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHead
        title={doc.title}
        sub={`${doc.category || "Event"} - ${doc.date || "TBA"}${doc.time ? ` - ${doc.time}` : ""} - ${doc.venue || "Venue TBA"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="ghost">
              <Link to="/leader/requirements"><ArrowLeft className="h-4 w-4" /> All trackers</Link>
            </AppButton>
            <AppButton
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this event tracker? This won't affect any OSA submissions.")) {
                  deleteEventDoc(doc.id);
                  toast.success("Tracker deleted");
                  navigate({ to: "/leader/requirements" });
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </AppButton>
          </div>
        }
      />
      <RequirementsTrackerContent doc={doc} viewer={{ role: "leader", name: session.name }} />
    </>
  );
}
