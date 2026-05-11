import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, StatCard, Panel, Badge, LineSpark, MiniBarChart } from "@/components/dashboard/DashboardLayout";
import { Users, Building2, Calendar, AlertTriangle, ShieldCheck, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <PageHead
        title="System overview"
        sub="University-wide health, growth, and moderation."
        action={
          <Link to="/admin/reports" className="inline-flex items-center gap-2 rounded-full bg-gradient-maroon px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105">
            Open reports <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value="18,412" delta="+87 today" icon={Users} tone="primary" />
        <StatCard label="Active orgs" value="120" delta="+3 this month" icon={Building2} tone="gold" />
        <StatCard label="Pending orgs" value="5" delta="Awaiting review" icon={ShieldCheck} tone="rose" />
        <StatCard label="Moderation alerts" value="3" delta="2 unresolved" icon={AlertTriangle} tone="emerald" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Platform engagement (last 12 weeks)">
          <LineSpark data={[300, 412, 520, 488, 612, 740, 810, 890, 1024, 1180, 1320, 1452]} />
        </Panel>
        <Panel title="New signups / week">
          <MiniBarChart data={[120, 145, 132, 168, 192, 184, 210, 224]} color="var(--primary)" />
        </Panel>
      </div>

      {/* Moderation queue + Pending orgs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Pending organization verifications" action={<Link to="/admin/organizations" className="text-xs font-semibold text-primary">Review queue</Link>}>
          <div className="space-y-3">
            {[
              { n: "UM Drone Society", c: "Tech", who: "Submitted by Aldous P." },
              { n: "UM AgriTech Hub", c: "Agriculture", who: "Submitted by Liza M." },
              { n: "UM Game Dev Guild", c: "Tech", who: "Submitted by Jared K." },
              { n: "UM Mental Wellness Circle", c: "Wellness", who: "Submitted by Faye R." },
              { n: "UM Astronomy Club", c: "Science", who: "Submitted by Rian C." },
            ].map((o, i) => (
              <div key={o.n} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-maroon text-xs font-bold text-primary-foreground">{o.n.split(" ")[1][0]}{o.n.split(" ")[2]?.[0] ?? ""}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{o.n}</p>
                  <p className="text-xs text-muted-foreground">{o.c} · {o.who}</p>
                </div>
                <Badge tone={i === 0 ? "warning" : "info"}>Pending</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Moderation alerts">
          <div className="space-y-3">
            {[
              { t: "Flagged announcement: 'Trip fundraiser claim'", d: "UM Travel Society · 2h ago", tone: "danger" as const },
              { t: "Duplicate event detected", d: "UM Cultural Night · 5h ago", tone: "warning" as const },
              { t: "Suspicious bulk signups (12 accts)", d: "Auto-flagged · Yesterday", tone: "warning" as const },
            ].map((a) => (
              <div key={a.t} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{a.t}</p>
                    <p className="text-xs text-muted-foreground">{a.d}</p>
                  </div>
                  <Badge tone={a.tone}>Flagged</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-gradient-maroon px-3 py-1 text-xs font-bold text-primary-foreground">Review</button>
                  <button className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Membership statistics">
          <div className="space-y-3 text-sm">
            {[
              ["Active members", "14,820", 82],
              ["Inactive", "2,940", 16],
              ["Suspended", "120", 1],
              ["Pending", "532", 3],
            ].map(([l, v, p]) => (
              <div key={l as string}>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{l}</span><span className="font-semibold">{v}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-maroon" style={{ width: `${p}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Top categories">
          {[
            ["Academic", 38],
            ["Community", 24],
            ["Sports", 18],
            ["Arts & Culture", 14],
            ["Advocacy", 12],
          ].map(([c, n]) => (
            <div key={c as string} className="flex items-center gap-3 py-2">
              <span className="w-32 truncate text-sm">{c}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-gold" style={{ width: `${((n as number) / 38) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-xs font-semibold">{n}</span>
            </div>
          ))}
        </Panel>

        <Panel title="System activity" action={<Activity className="h-4 w-4 text-primary" />}>
          <ul className="space-y-2 text-sm">
            {[
              ["UM CS Society approved 3 members", "2m"],
              ["New event published: Eco Run", "9m"],
              ["Admin verified UM Drone Society", "32m"],
              ["Bulk announcement sent (org leaders)", "1h"],
              ["Backup completed successfully", "3h"],
            ].map(([t, when]) => (
              <li key={t as string} className="flex items-start gap-2 rounded-xl bg-secondary/40 p-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-gold" />
                <span className="flex-1">{t}</span>
                <span className="text-xs text-muted-foreground">{when}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Events stats */}
      <div className="mt-6">
        <Panel title="Recent campus events" action={<Link to="/admin/events" className="text-xs font-semibold text-primary">View all</Link>}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Innovation Summit", h: "UM CS Society", st: "Live", tone: "success" as const },
              { t: "Eco Run", h: "UM Eco Warriors", st: "Open", tone: "info" as const },
              { t: "Cultural Night", h: "UM Theatre Guild", st: "Pending", tone: "warning" as const },
              { t: "Sportsfest", h: "UM Athletics", st: "Pending", tone: "warning" as const },
            ].map((e) => (
              <div key={e.t} className="rounded-2xl bg-secondary/60 p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <Badge tone={e.tone}>{e.st}</Badge>
                </div>
                <p className="mt-2 font-display text-sm font-bold">{e.t}</p>
                <p className="text-xs text-muted-foreground">{e.h}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
