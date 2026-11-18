import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { complianceTone, formatComplianceStatus, useComplianceSubmissions } from "@/lib/org-compliance";

export const Route = createFileRoute("/admin2/compliance/")({
  component: Admin2Compliance,
});

function Admin2Compliance() {
  const submissions = useComplianceSubmissions().filter((submission) => submission.status === "pending_admin2");

  return (
    <>
      <PageHead title="Compliance overview" sub="Validate adviser-cleared accreditation records before they reach Admin 1." />
      <Panel>
        {submissions.length === 0 ? (
          <EmptyState title="No compliance reviews pending" sub="Adviser-cleared submissions will appear here for secondary validation." icon={ShieldCheck} />
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
                  {submission.data.accreditationScope} - {submission.data.memberCount} members - {submission.data.category}
                </p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/admin2/compliance/$submissionId" params={{ submissionId: submission.id }}>
                    Review compliance <ArrowRight className="h-4 w-4" />
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
