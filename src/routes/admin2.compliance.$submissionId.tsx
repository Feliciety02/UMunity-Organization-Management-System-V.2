import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { OrgComplianceDetail } from "@/components/workflows/OrgComplianceDetail";
import { EmptyState, Panel } from "@/components/dashboard/DashboardLayout";
import { useComplianceSubmission } from "@/lib/org-compliance";

export const Route = createFileRoute("/admin2/compliance/$submissionId")({
  component: Admin2ComplianceDetailPage,
});

function Admin2ComplianceDetailPage() {
  const { submissionId } = Route.useParams();
  const submission = useComplianceSubmission(submissionId);

  if (!submission) {
    return (
      <Panel>
        <EmptyState
          title="Compliance submission not found"
          sub="The record may have been moved or removed."
          icon={SearchX}
        />
      </Panel>
    );
  }

  return (
    <OrgComplianceDetail
      submission={submission}
      viewer={{ role: "admin2", name: "Dr. Celeste Dizon" }}
      backTo="/admin2/compliance"
      backLabel="Compliance queue"
    />
  );
}
