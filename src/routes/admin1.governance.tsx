import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";

export const Route = createFileRoute("/admin1/governance")({
  component: Admin1Governance,
});

function Admin1Governance() {
  return (
    <>
      <PageHead title="Governance and records" sub="Final authority tools for accreditation, officer transitions, and institution-wide workflow policy." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Upcoming governance cycles">
          <div className="space-y-3">
            {[
              ["Officer transition workflow", "Planned for June"],
              ["Annual accreditation review", "In preparation"],
              ["University settings audit", "Quarterly"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3">
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">Managed by Admin 1</p>
                </div>
                <Badge tone="info">{status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Policy note">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Officer transition archival is now live through a governed workflow. Admin 1 can review, approve, and preserve previous officer records without manual replacement.</p>
            <p>Accreditation renewals now use the same workflow language, so final authority decisions no longer depend on scattered document packets.</p>
            <div className="flex flex-wrap gap-2">
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
