import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, StatCard, MiniBarChart } from "@/components/dashboard/DashboardLayout";
import { Activity, CheckCircle2, Clock3, Users } from "lucide-react";

export const Route = createFileRoute("/adviser/analytics")({
  component: AdviserAnalytics,
});

function AdviserAnalytics() {
  return (
    <>
      <PageHead title="Adviser analytics" sub="Snapshot of organization participation, review turnaround, and member activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending reviews" value="3" delta="2 submitted today" icon={Clock3} tone="gold" />
        <StatCard label="Approved this month" value="14" delta="Avg 1.7 days turnaround" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Active members" value="412" delta="+24 this month" icon={Users} tone="primary" />
        <StatCard label="Engagement pulse" value="88%" delta="Based on event activity" icon={Activity} tone="rose" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Weekly activity reviews">
          <MiniBarChart data={[3, 5, 4, 6, 7, 5, 6, 8]} color="var(--primary)" />
        </Panel>
        <Panel title="Adviser notes">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Use this lane to monitor the quality of officer submissions before they escalate to university approval.</p>
            <p>The adviser view now acts as the first structured approval layer instead of relying on paper routing.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
