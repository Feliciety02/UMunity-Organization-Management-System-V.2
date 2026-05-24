import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { EmptyState, Badge, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import {
  applyAccreditationDecision,
  formatOrgAccreditationStatus,
  formatOrgLifecycleStatus,
  orgAccreditationTone,
  orgLifecycleTone,
  sendOrgRegistryNotification,
  setOrgLifecycleStatus,
  useOrgRecord,
} from "@/lib/org-registry";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { SearchX } from "lucide-react";

export const Route = createFileRoute("/admin1/organizations/$slug")({
  component: Admin1OrganizationDetailPage,
});

function Admin1OrganizationDetailPage() {
  const { slug } = Route.useParams();
  const record = useOrgRecord(slug);
  const latestCompliance = useComplianceSubmissions()
    .filter((submission) => submission.orgSlug === slug)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];

  if (!record) {
    return (
      <Panel>
        <EmptyState
          title="Organization record not found"
          sub="This registry record may have been moved or removed."
          icon={SearchX}
        />
      </Panel>
    );
  }

  const currentRecord = record;

  function markRecognized() {
    setOrgLifecycleStatus(currentRecord.slug, {
      status: "recognized",
      accreditationStatus: "active",
      by: "Dr. Lucia Del Rosario",
      note: "Admin 1 restored or confirmed recognized standing in the organization registry.",
    });
    sendOrgRegistryNotification(
      currentRecord.slug,
      `${currentRecord.name} is now marked recognized`,
      "Registry updated",
    );
    toast.success("Organization marked as recognized");
  }

  function markProbationary() {
    setOrgLifecycleStatus(currentRecord.slug, {
      status: "probationary",
      accreditationStatus: "under_review",
      by: "Dr. Lucia Del Rosario",
      note: "Admin 1 placed the organization on probation pending governance correction.",
    });
    sendOrgRegistryNotification(
      currentRecord.slug,
      `${currentRecord.name} has been placed on probation`,
      "Registry updated",
    );
    toast.success("Organization moved to probationary status");
  }

  function markDisbanded() {
    setOrgLifecycleStatus(currentRecord.slug, {
      status: "disbanded",
      accreditationStatus: "suspended",
      by: "Dr. Lucia Del Rosario",
      note: "Admin 1 disbanded the organization and suspended its registry standing.",
    });
    sendOrgRegistryNotification(
      currentRecord.slug,
      `${currentRecord.name} has been marked disbanded`,
      "Registry updated",
    );
    toast.success("Organization marked as disbanded");
  }

  function markPendingReview() {
    applyAccreditationDecision(currentRecord.slug, {
      by: "Dr. Lucia Del Rosario",
      academicYear: latestCompliance?.academicYear ?? currentRecord.accreditationAcademicYear,
      status: "under_review",
      lifecycleStatus: "pending_review",
      note: "Admin 1 moved the organization into pending lifecycle review.",
    });
    sendOrgRegistryNotification(
      currentRecord.slug,
      `${currentRecord.name} moved to pending review`,
      "Registry updated",
    );
    toast.success("Organization moved to pending review");
  }

  return (
    <>
      <PageHead
        title={currentRecord.name}
        sub="Final lifecycle authority for recognition, accreditation standing, and organization continuity."
        action={
          <AppButton asChild variant="secondary" size="sm">
            <Link to="/admin1/organizations">Back to registry</Link>
          </AppButton>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Registry status">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={orgLifecycleTone(currentRecord.lifecycleStatus)}>
                {formatOrgLifecycleStatus(currentRecord.lifecycleStatus)}
              </Badge>
              <Badge tone={orgAccreditationTone(currentRecord.accreditationStatus)}>
                {formatOrgAccreditationStatus(currentRecord.accreditationStatus)}
              </Badge>
              <Badge tone="neutral">{currentRecord.accreditationAcademicYear}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Category" value={currentRecord.category} />
              <Field label="Members" value={`${currentRecord.members}`} />
              <Field label="Adviser" value={currentRecord.adviserName} />
              <Field
                label="Last decision"
                value={new Date(currentRecord.lastDecisionAt).toLocaleDateString()}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <AppButton variant="primary" size="sm" onClick={markRecognized}>
                Mark recognized
              </AppButton>
              <AppButton variant="secondary" size="sm" onClick={markPendingReview}>
                Pending review
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={markProbationary}>
                Set probationary
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={markDisbanded}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Disband organization
              </AppButton>
            </div>
          </div>
        </Panel>

        <Panel title="Accreditation link">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Accreditation approval now updates the organization registry automatically, but Admin
              1 can still adjust lifecycle standing here when governance action is broader than one
              submission.
            </p>
            {latestCompliance ? (
              <>
                <p className="text-foreground">
                  Latest submission: <strong>{latestCompliance.academicYear}</strong> -{" "}
                  {latestCompliance.data.accreditationScope}
                </p>
                <AppButton asChild variant="secondary" size="sm">
                  <Link
                    to="/admin1/accreditation/$submissionId"
                    params={{ submissionId: latestCompliance.id }}
                  >
                    Open accreditation decision
                  </Link>
                </AppButton>
              </>
            ) : (
              <p>No accreditation submission is currently attached to this organization.</p>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Governance history" className="mt-6">
        <div className="space-y-3">
          {currentRecord.history.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-secondary/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{entry.by}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/35 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
