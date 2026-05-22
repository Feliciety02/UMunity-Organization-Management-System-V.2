import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, StatCard, MiniBarChart } from "@/components/dashboard/DashboardLayout";
import { Activity, CheckCircle2, Clock3, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { useAdviserInsights } from "@/lib/adviser-insights";

export const Route = createFileRoute("/adviser/analytics")({
  component: AdviserAnalytics,
});

function AdviserAnalytics() {
  const session = getSession();
  const insights = useAdviserInsights(session?.org);

  return (
    <>
      <PageHead title="Adviser analytics" sub="Snapshot of organization participation, review turnaround, and member activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending reviews" value={`${insights.pendingReviews}`} delta="Across workflows, posts, trackers, and compliance" icon={Clock3} tone="gold" />
        <StatCard label="Approved this month" value={`${insights.approvedThisMonth}`} delta={`Avg ${insights.avgTurnaroundDays.toFixed(1)} days turnaround`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Active members" value={`${insights.activeMembers}`} delta="Pulled from the active accreditation roster" icon={Users} tone="primary" />
        <StatCard label="Engagement pulse" value={`${insights.engagementPulse}%`} delta="Based on review throughput and member contribution activity" icon={Activity} tone="rose" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Weekly activity reviews">
          <MiniBarChart data={insights.weeklyReviews} color="var(--primary)" />
        </Panel>
        <Panel title="Adviser notes">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Use this lane to monitor how quickly officer submissions move from draft to review-ready across events, requirements, posts, and accreditation.</p>
            <p>The adviser role now acts as a true operational checkpoint, not just a paper sign-off, so these metrics reflect real workflow movement in the dashboard stores.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
