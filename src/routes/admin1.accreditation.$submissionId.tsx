import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { OrgComplianceDetail } from "@/components/workflows/OrgComplianceDetail";
import { EmptyState, Panel } from "@/components/dashboard/DashboardLayout";
import { useComplianceSubmission } from "@/lib/org-compliance";

export const Route = createFileRoute("/admin1/accreditation/$submissionId")({
  component: Admin1AccreditationDetailPage,
});

function Admin1AccreditationDetailPage() {
  const { submissionId } = Route.useParams();
  const submission = useComplianceSubmission(submissionId);

  if (!submission) {
    return (
      <Panel>
        <EmptyState
          title="Accreditation submission not found"
          sub="The record may have been moved or removed."
          icon={SearchX}
        />
      </Panel>
    );
  }

  return (
    <OrgComplianceDetail
      submission={submission}
      viewer={{ role: "admin1", name: "Dr. Lucia Del Rosario" }}
      backTo="/admin1/accreditation"
      backLabel="Final authority queue"
    />
  );
}
