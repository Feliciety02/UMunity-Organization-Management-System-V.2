import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { complianceTone, formatComplianceStatus, useComplianceSubmissions } from "@/lib/org-compliance";

export const Route = createFileRoute("/adviser/compliance")({
  component: AdviserCompliancePage,
});

function AdviserCompliancePage() {
  const submissions = useComplianceSubmissions().filter((submission) => submission.status === "pending_adviser");

  return (
    <>
      <PageHead title="Accreditation review" sub="Validate organization identity, leadership readiness, and annual governance before university review." />
      <Panel>
        {submissions.length === 0 ? (
          <EmptyState title="No accreditation reviews pending" sub="Leader submissions will appear here for adviser validation." icon={Building2} />
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
                  {submission.data.accreditationScope} - {submission.data.category} - Adviser: {submission.data.adviserName}
                </p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/adviser/compliance/$submissionId" params={{ submissionId: submission.id }}>
                    Review submission <ArrowRight className="h-4 w-4" />
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
