import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { complianceTone, formatComplianceStatus, useComplianceSubmissions } from "@/lib/org-compliance";

export const Route = createFileRoute("/admin1/accreditation")({
  component: Admin1AccreditationPage,
});

function Admin1AccreditationPage() {
  const submissions = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin1");

  return (
    <>
      <PageHead title="Final accreditation authority" sub="Grant or hold recognition after adviser and Admin 2 checks are complete." />
      <Panel>
        {submissions.length === 0 ? (
          <EmptyState title="No final accreditation decisions pending" sub="Only fully validated compliance submissions reach this queue." icon={Landmark} />
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={complianceTone(submission.status)}>{formatComplianceStatus(submission.status)}</Badge>
                  <Badge tone="neutral">{submission.academicYear}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{submission.orgName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {submission.data.accreditationScope} - {submission.data.category} - Final authority checkpoint
                </p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/admin1/accreditation/$submissionId" params={{ submissionId: submission.id }}>
                    Open decision view <ArrowRight className="h-4 w-4" />
                  </Link>
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
