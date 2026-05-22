import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Landmark, ShieldCheck, UserCog } from "lucide-react";
import { Badge, MiniBarChart, PageHead, Panel, StatCard } from "@/components/dashboard/DashboardLayout";
import { useAdminInsights } from "@/lib/admin-insights";

export const Route = createFileRoute("/admin1/authority")({
  component: Admin1Authority,
});

function Admin1Authority() {
  const insights = useAdminInsights("admin1");

  return (
    <>
      <PageHead title="Final authority view" sub="University-wide oversight for final approvals, archived transitions, and accreditation governance." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Final approvals pending" value={`${insights.queueCount}`} delta="Items waiting for university authority" icon={Landmark} tone="gold" />
        <StatCard label="Decisions this month" value={`${insights.monthlyDecisions}`} delta={`Avg ${insights.avgTurnaroundDays.toFixed(1)} days final turnaround`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Accredited orgs" value={`${insights.accreditedOrgs}`} delta="Live accreditation records already cleared" icon={ShieldCheck} tone="primary" />
        <StatCard label="Archived transitions" value={`${insights.archivedTransitions}`} delta="Officer cycles preserved in governance history" icon={UserCog} tone="rose" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Weekly final decisions">
          <MiniBarChart data={insights.weeklyDecisions} color="var(--primary)" />
        </Panel>
        <Panel title="Authority notes">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Admin 1 now operates as the final authority for workflow approval, accreditation, and annual officer transitions.</p>
            <p>This page keeps institution-wide approvals in one view so governance actions stay traceable instead of disappearing into separate route silos.</p>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Authority queue">
          <div className="space-y-3">
            {insights.queueItems.length === 0 ? (
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No final authority items are waiting right now.</div>
            ) : (
              insights.queueItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href as string}
                  className="block rounded-2xl border border-border bg-card p-4 transition hover:bg-secondary/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.tone}>{item.status}</Badge>
                    <Badge tone="neutral">{item.lane}</Badge>
                    <span className="text-[11px] text-muted-foreground">{item.ageHours}h waiting</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.orgName} - {item.note}</p>
                </Link>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Governance cycles">
          <div className="space-y-3">
            {insights.governanceCycles.length === 0 ? (
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">Governance cycles will appear here as transition and accreditation records mature.</div>
            ) : (
              insights.governanceCycles.map((item) => (
                <Link
                  key={`${item.title}-${item.href}`}
                  to={item.href as string}
                  className="block rounded-2xl bg-secondary/35 p-4 transition hover:bg-secondary/55"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                    <Badge tone={item.status === "Archived" || item.status === "Accredited" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
