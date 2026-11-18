import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Building2, Calendar, TrendingUp, Users } from "lucide-react";
import { PageHead, Panel, StatCard, MiniBarChart, LineSpark, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { events, organizations } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";
import { useRsvps } from "@/lib/rsvp";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const ranges = ["4 weeks", "12 weeks", "12 months"] as const;

const SERIES: Record<(typeof ranges)[number], { engagement: number[]; signups: number[] }> = {
  "4 weeks": { engagement: [1180, 1320, 1390, 1452], signups: [184, 210, 224, 236] },
  "12 weeks": {
    engagement: [300, 412, 520, 488, 612, 740, 810, 890, 1024, 1180, 1320, 1452],
    signups: [120, 145, 132, 168, 192, 184, 210, 224, 230, 212, 236, 248],
  },
  "12 months": {
    engagement: [1200, 1450, 1820, 2100, 2440, 2980, 3520, 4180, 4920, 5780, 6840, 8200],
    signups: [420, 380, 510, 640, 590, 720, 810, 760, 880, 940, 1020, 1100],
  },
};

function Analytics() {
  const loading = useDashboardPageLoading();
  const [range, setRange] = useState<(typeof ranges)[number]>("12 weeks");
  const rsvps = useRsvps();

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of organizations) map.set(o.category, (map.get(o.category) ?? 0) + o.members);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, []);
  const maxCategory = categories[0]?.[1] ?? 1;

  const rsvpByEvent = useMemo(
    () =>
      events.map((e) => ({
        title: e.title,
        going: rsvps.filter((r) => r.eventTitle === e.title && r.status === "going").length,
        maybe: rsvps.filter((r) => r.eventTitle === e.title && r.status === "maybe").length,
      })),
    [rsvps],
  );

  if (loading) {
    return (
      <>
        <PageHead title="Analytics" sub="Loading platform metrics." />
        <PanelSkeleton rows={6} />
      </>
    );
  }

  const totalMembers = organizations.reduce((sum, o) => sum + o.members, 0);
  const series = SERIES[range];

  return (
    <>
      <PageHead
        title="Analytics"
        sub="Monitor platform trends, organization growth, and event engagement metrics."
        action={
          <AppButton asChild variant="secondary" size="md">
            <Link to="/admin/reports">
              <BarChart3 className="h-4 w-4" /> Export reports
            </Link>
          </AppButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Org memberships" value={totalMembers.toLocaleString()} delta={`${organizations.length} organizations`} icon={Users} tone="primary" />
        <StatCard label="Organizations" value={String(organizations.length)} delta={`${categories.length} categories`} icon={Building2} tone="gold" />
        <StatCard label="Upcoming events" value={String(events.length)} icon={Calendar} tone="rose" />
        <StatCard label="Active RSVPs" value={String(rsvps.filter((r) => r.status !== "cancelled").length)} icon={TrendingUp} tone="emerald" />
      </div>

      <div className="mt-6">
        <AppTabs items={ranges} value={range} onChange={setRange} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={`Platform engagement (${range})`}>
          <LineSpark data={series.engagement} />
        </Panel>
        <Panel title={`New signups (${range})`}>
          <MiniBarChart data={series.signups} color="var(--primary)" />
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Members by category">
          <div className="space-y-1">
            {categories.map(([name, members]) => (
              <div key={name} className="flex items-center gap-3 py-1.5">
                <span className="w-32 truncate text-sm">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${(members / maxCategory) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-xs font-semibold">{members}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="RSVPs by event">
          <ul className="divide-y divide-border text-sm">
            {rsvpByEvent.map((e) => (
              <li key={e.title} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate">{e.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{e.going}</span> going · {e.maybe} maybe
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
