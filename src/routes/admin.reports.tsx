import { createFileRoute } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { downloadCsv } from "@/lib/csv";
import { showStatusToast } from "@/lib/feedback";
import { organizations } from "@/data/site";
import {
  PageHead,
  Panel,
  StatCard,
  MiniBarChart,
  LineSpark,
} from "@/components/dashboard/DashboardLayout";
import { Users, Building2, Calendar, TrendingUp, Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
});

const REPORT_ROWS = organizations.map((o) => ({
  Organization: o.name,
  Category: o.category,
  Members: o.members,
}));

function Reports() {
  return (
    <>
      <PageHead
        title="Reports & analytics"
        sub="Generate insights and export reports for OSA."
        action={
          <AppButton variant="primary" size="md" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Export PDF
          </AppButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value="18,412" delta="+12% MoM" icon={Users} tone="primary" />
        <StatCard
          label="Active orgs"
          value="120"
          delta="+3 this month"
          icon={Building2}
          tone="gold"
        />
        <StatCard label="Events this term" value="284" icon={Calendar} tone="rose" />
        <StatCard
          label="Engagement"
          value="87%"
          delta="+6% vs last term"
          icon={TrendingUp}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="User growth (12 months)">
          <LineSpark
            data={[1200, 1450, 1820, 2100, 2440, 2980, 3520, 4180, 4920, 5780, 6840, 8200]}
          />
        </Panel>
        <Panel title="Event volume / month">
          <MiniBarChart
            data={[18, 22, 28, 31, 24, 36, 42, 38, 46, 52, 48, 56]}
            color="var(--gold)"
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Top performing organizations">
          {[
            ["UM Volunteer Corps", 510],
            ["UM CS Society", organizations.find((o) => o.slug === "cs-society")?.members ?? 0],
            ["UM Athletics League", 320],
            ["UM Engineering Circle", 295],
            ["UM Eco Warriors", 256],
          ].map(([n, m]) => (
            <div key={n as string} className="flex items-center gap-3 py-2 text-sm">
              <span className="flex-1 truncate">{n}</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${((m as number) / 510) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-semibold">{m}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Available reports">
          <div className="space-y-2 text-sm">
            {[
              "Monthly engagement report",
              "Per-org membership report",
              "Event attendance summary",
              "User signup analytics",
              "Moderation activity log",
              "Annual organization roster",
            ].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  downloadCsv(`${r.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`, REPORT_ROWS);
                  showStatusToast("Report downloaded", `${r} was saved as a CSV file.`);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-left transition hover:bg-secondary"
              >
                <span>{r}</span>
                <Download className="h-3.5 w-3.5 text-primary" />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Active hours (heatmap)">
          <div className="grid grid-cols-12 gap-0.5">
            {Array.from({ length: 84 }).map((_, i) => {
              // Deterministic pseudo-activity so the heatmap doesn't reshuffle on every render.
              const v = ((i * 37) % 23) / 22;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${Math.round(v * 100)}%, var(--secondary))`,
                  }}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Peak: Wed 4-6 PM</p>
        </Panel>
      </div>
    </>
  );
}
