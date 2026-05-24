import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { OrgComplianceDetail } from "@/components/workflows/OrgComplianceDetail";
import { EmptyState, Panel } from "@/components/dashboard/DashboardLayout";
import { useComplianceSubmission } from "@/lib/org-compliance";

export const Route = createFileRoute("/adviser/compliance/$submissionId")({
  component: AdviserComplianceDetailPage,
});

function AdviserComplianceDetailPage() {
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
      viewer={{ role: "adviser", name: "Prof. Elena Tan" }}
      backTo="/adviser/compliance"
      backLabel="Accreditation queue"
    />
  );
}
