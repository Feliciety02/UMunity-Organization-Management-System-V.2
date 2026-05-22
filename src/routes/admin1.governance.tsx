import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { useAdminInsights } from "@/lib/admin-insights";

export const Route = createFileRoute("/admin1/governance")({
  component: Admin1Governance,
});

function Admin1Governance() {
  const insights = useAdminInsights("admin1");

  return (
    <>
      <PageHead title="Governance and records" sub="Final authority tools for accreditation, officer transitions, and institution-wide workflow policy." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Upcoming governance cycles">
          <div className="space-y-3">
            {insights.governanceCycles.length === 0 ? (
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                Governance cycles will appear here as final authority approvals and archival actions accumulate.
              </div>
            ) : insights.governanceCycles.map((item) => (
              <Link key={`${item.title}-${item.href}`} to={item.href as string} className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3 transition hover:bg-secondary/55">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <Badge tone={item.status === "Archived" || item.status === "Accredited" ? "success" : "info"}>{item.status}</Badge>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Policy note">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Officer transition archival is now live through a governed workflow. Admin 1 can review, approve, and preserve previous officer records without manual replacement.</p>
            <p>Accreditation renewals now use the same workflow language, so final authority decisions no longer depend on scattered document packets.</p>
            <div className="flex flex-wrap gap-2">
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/admin1/authority">Open final authority view</Link>
              </AppButton>
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/admin1/transitions">Open officer transitions</Link>
              </AppButton>
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/admin1/accreditation">Open accreditation queue</Link>
              </AppButton>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
