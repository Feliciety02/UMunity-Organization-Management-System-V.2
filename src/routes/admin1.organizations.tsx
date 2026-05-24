import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Landmark, ShieldAlert } from "lucide-react";
import { Badge, PageHead, Panel, StatCard } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import {
  formatOrgAccreditationStatus,
  formatOrgLifecycleStatus,
  orgAccreditationTone,
  orgLifecycleTone,
  useOrgRegistry,
} from "@/lib/org-registry";

export const Route = createFileRoute("/admin1/organizations")({
  component: Admin1OrganizationsPage,
});

function Admin1OrganizationsPage() {
  const registry = useOrgRegistry();
  const recognized = registry.filter((record) => record.lifecycleStatus === "recognized").length;
  const underReview = registry.filter((record) => record.lifecycleStatus === "pending_review").length;
  const probationary = registry.filter((record) => record.lifecycleStatus === "probationary").length;
  const disbanded = registry.filter((record) => record.lifecycleStatus === "disbanded").length;

  return (
    <>
      <PageHead title="Organization registry" sub="Admin 1 lifecycle authority for recognition, probation, disbandment, and accreditation posture." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recognized" value={`${recognized}`} delta="Organizations currently in good standing" icon={Landmark} tone="emerald" />
        <StatCard label="Pending review" value={`${underReview}`} delta="Lifecycle review still open" icon={ShieldAlert} tone="gold" />
        <StatCard label="Probationary" value={`${probationary}`} delta="Needs corrective governance follow-up" icon={Building2} tone="rose" />
        <StatCard label="Disbanded" value={`${disbanded}`} delta="Archived or removed from recognition" icon={ShieldAlert} tone="primary" />
      </div>

      <Panel title="Registry records" className="mt-6">
        <div className="space-y-3">
          {registry.map((record) => (
            <div key={record.slug} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={orgLifecycleTone(record.lifecycleStatus)}>{formatOrgLifecycleStatus(record.lifecycleStatus)}</Badge>
                <Badge tone={orgAccreditationTone(record.accreditationStatus)}>{formatOrgAccreditationStatus(record.accreditationStatus)}</Badge>
                <Badge tone="neutral">{record.accreditationAcademicYear}</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold">{record.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {record.category} - {record.members} members - Adviser: {record.adviserName}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{record.history[0]?.note ?? "No governance activity logged yet."}</p>
              <AppButton asChild variant="secondary" size="sm" className="mt-3">
                <Link to="/admin1/organizations/$slug" params={{ slug: record.slug }}>
                  Open record <ArrowRight className="h-4 w-4" />
                </Link>
              </AppButton>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
