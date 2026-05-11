import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, StatCard, Badge, MiniBarChart } from "@/components/dashboard/DashboardLayout";
import { CheckSquare, Users, TrendingUp, Calendar } from "lucide-react";

export const Route = createFileRoute("/leader/attendance")({
  component: Attendance,
});

function Attendance() {
  return (
    <>
      <PageHead title="Event attendance" sub="Track turnout and engagement across events." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg attendance" value="84%" delta="+3% vs last sem" icon={CheckSquare} tone="primary" />
        <StatCard label="Active attendees" value="284" icon={Users} tone="gold" />
        <StatCard label="Top event" value="Hack 2025" icon={TrendingUp} tone="rose" />
        <StatCard label="Events tracked" value="38" icon={Calendar} tone="emerald" />
      </div>

      <Panel title="Attendance trend" className="mt-6">
        <MiniBarChart data={[72, 80, 78, 84, 88, 86, 92, 84]} color="var(--gold)" />
      </Panel>

      <Panel title="Recent events" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Event</th><th>Date</th><th>RSVPs</th><th>Attended</th><th>Rate</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {([
                { t: "Innovation Summit 2026", d: "May 24", r: 184, a: 162, s: "Upcoming", tone: "info" as const },
                { t: "Hack Night Vol. 2", d: "Apr 18", r: 78, a: 70, s: "Completed", tone: "success" as const },
                { t: "Coding Bootcamp Day 3", d: "Apr 03", r: 64, a: 58, s: "Completed", tone: "success" as const },
                { t: "Welcome Mixer 2026", d: "Mar 12", r: 142, a: 118, s: "Completed", tone: "success" as const },
                { t: "Tech Talk: Web3", d: "Feb 20", r: 92, a: 64, s: "Completed", tone: "warning" as const },
              ]).map((row) => {
                const rate = Math.round((row.a / row.r) * 100);
                return (
                  <tr key={row.t} className="hover:bg-secondary/40">
                    <td className="py-3 font-semibold">{row.t}</td>
                    <td className="text-muted-foreground">{row.d}</td>
                    <td>{row.r}</td>
                    <td>{row.a}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-maroon" style={{ width: `${rate}%` }} /></div>
                        <span className="text-xs">{rate}%</span>
                      </div>
                    </td>
                    <td><Badge tone={row.tone}>{row.s}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
