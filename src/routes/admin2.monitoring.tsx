import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { Badge, MiniBarChart, PageHead, Panel, StatCard } from "@/components/dashboard/DashboardLayout";
import { useAdminInsights } from "@/lib/admin-insights";

export const Route = createFileRoute("/admin2/monitoring")({
  component: Admin2Monitoring,
});

function Admin2Monitoring() {
  const insights = useAdminInsights("admin2");

  return (
    <>
      <PageHead title="Admin 2 monitoring" sub="Cross-workflow view of secondary validation, compliance pressure, and escalation readiness." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active queue" value={`${insights.queueCount}`} delta="Across workflows, posts, closeouts, trackers, and accreditation" icon={Clock3} tone="gold" />
        <StatCard label="Escalated to Admin 1" value={`${insights.escalatedCount}`} delta="Records that already cleared secondary validation" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Revision pressure" value={`${insights.revisionLoad}`} delta={`Avg ${insights.avgTurnaroundDays.toFixed(1)} days validation time`} icon={AlertTriangle} tone="rose" />
        <StatCard label="Decisions this month" value={`${insights.monthlyDecisions}`} delta="Admin 2 approvals and publishing actions" icon={ShieldAlert} tone="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Weekly validation throughput">
          <MiniBarChart data={insights.weeklyDecisions} color="var(--primary)" />
        </Panel>
        <Panel title="Operational notes">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Admin 2 is now the secondary checkpoint across event proposals, post publishing, closeout packets, requirements, and accreditation.</p>
            <p>Use this page to catch aged submissions before they block student activity or reach Admin 1 with unresolved compliance risk.</p>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Priority queue">
          <div className="space-y-3">
            {insights.queueItems.length === 0 ? (
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No active Admin 2 queue items right now.</div>
            ) : (
              insights.queueItems.slice(0, 6).map((item) => (
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

        <Panel title="Organization watchlist">
          <div className="space-y-3">
            {insights.orgWatchlist.length === 0 ? (
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No organizations need added monitoring.</div>
            ) : (
              insights.orgWatchlist.map((item) => (
                <div key={item.orgName} className="rounded-2xl bg-secondary/35 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.orgName}</p>
                      <p className="text-xs text-muted-foreground">{item.activityLabel}</p>
                    </div>
                    <Badge tone={item.finalAuthorityItems > 0 ? "warning" : item.revisionItems > 0 ? "danger" : "info"}>
                      {item.pendingItems} active
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-background/70 px-2 py-2">
                      <p className="font-semibold">{item.pendingItems}</p>
                      <p className="text-muted-foreground">Pending</p>
                    </div>
                    <div className="rounded-xl bg-background/70 px-2 py-2">
                      <p className="font-semibold">{item.revisionItems}</p>
                      <p className="text-muted-foreground">Revisions</p>
                    </div>
                    <div className="rounded-xl bg-background/70 px-2 py-2">
                      <p className="font-semibold">{item.finalAuthorityItems}</p>
                      <p className="text-muted-foreground">Escalated</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
