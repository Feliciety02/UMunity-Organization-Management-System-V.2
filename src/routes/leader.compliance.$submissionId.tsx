import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { OrgComplianceDetail } from "@/components/workflows/OrgComplianceDetail";
import { EmptyState, Panel } from "@/components/dashboard/DashboardLayout";
import { useComplianceSubmission } from "@/lib/org-compliance";

export const Route = createFileRoute("/leader/compliance/$submissionId")({
  component: LeaderComplianceDetailPage,
});

function LeaderComplianceDetailPage() {
  const { submissionId } = Route.useParams();
  const submission = useComplianceSubmission(submissionId);

  if (!submission) {
    return (
      <Panel>
        <EmptyState
          title="Compliance workspace not found"
          sub="The accreditation submission may have been removed."
          icon={SearchX}
        />
      </Panel>
    );
  }

  return (
    <OrgComplianceDetail
      submission={submission}
      viewer={{ role: "leader", name: submission.createdBy }}
      backTo="/leader/compliance"
      backLabel="All submissions"
    />
  );
}
