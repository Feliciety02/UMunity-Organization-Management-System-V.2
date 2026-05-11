import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, StatCard, Panel, Badge, MiniBarChart, Avatar } from "@/components/dashboard/DashboardLayout";
import { Users, UserPlus, Calendar, TrendingUp, ArrowRight, Megaphone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/leader/")({
  component: LeaderDashboard,
});

function LeaderDashboard() {
  return (
    <>
      <PageHead
        title="UM Computer Studies Society"
        sub="Manage your organization with clarity and speed."
        action={
          <Link to="/leader/create-event" className="inline-flex items-center gap-2 rounded-full bg-gradient-maroon px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-105">
            New event <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value="412" delta="+24 this month" icon={Users} tone="primary" />
        <StatCard label="Pending requests" value="12" delta="Action needed" icon={UserPlus} tone="gold" />
        <StatCard label="Upcoming events" value="4" icon={Calendar} tone="rose" />
        <StatCard label="Engagement rate" value="87%" delta="+6% vs. last month" icon={TrendingUp} tone="emerald" />
      </div>

      {/* Bento */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Member growth" action={<span className="text-xs text-muted-foreground">Last 8 weeks</span>}>
          <MiniBarChart data={[210, 245, 268, 290, 312, 348, 388, 412]} color="var(--primary)" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-secondary/60 p-3"><p className="font-display text-lg font-bold">+202</p><p className="text-[10px] uppercase text-muted-foreground">New / 2mos</p></div>
            <div className="rounded-xl bg-secondary/60 p-3"><p className="font-display text-lg font-bold">94%</p><p className="text-[10px] uppercase text-muted-foreground">Retention</p></div>
            <div className="rounded-xl bg-secondary/60 p-3"><p className="font-display text-lg font-bold">4.8★</p><p className="text-[10px] uppercase text-muted-foreground">Avg rating</p></div>
          </div>
        </Panel>

        <Panel title="Org profile" className="lg:col-span-1">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep font-display text-xl font-bold text-primary-foreground shadow-soft">CS</div>
          <p className="mt-3 font-display text-base font-bold">UM CS Society</p>
          <p className="text-xs text-muted-foreground">Academic · Est. 2014</p>
          <div className="mt-4 space-y-2 text-xs">
            <p className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><Badge tone="success">Recognized</Badge></p>
            <p className="flex items-center justify-between"><span className="text-muted-foreground">President</span><span className="font-semibold">Marco R.</span></p>
            <p className="flex items-center justify-between"><span className="text-muted-foreground">Adviser</span><span className="font-semibold">Prof. Tan</span></p>
          </div>
          <Link to="/leader/organization" className="mt-5 block rounded-full bg-secondary py-2 text-center text-xs font-semibold text-primary">Edit org profile</Link>
        </Panel>
      </div>

      {/* Pending requests + Events */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Pending membership requests" action={<Link to="/leader/requests" className="text-xs font-semibold text-primary">Review all</Link>}>
          <div className="space-y-3">
            {[
              { n: "Jana Cruz", c: "BS IT · 2nd Year", d: "Today" },
              { n: "Marvin Lim", c: "BS CS · 1st Year", d: "Today" },
              { n: "Ria Santos", c: "BS IS · 3rd Year", d: "Yesterday" },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
                <Avatar name={r.n} color="from-rose-400 to-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{r.n}</p>
                  <p className="text-xs text-muted-foreground">{r.c} · {r.d}</p>
                </div>
                <button className="rounded-full bg-gradient-maroon px-3 py-1 text-xs font-bold text-primary-foreground">Approve</button>
                <button className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Deny</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming events" action={<Link to="/leader/manage-events" className="text-xs font-semibold text-primary">Manage</Link>}>
          <div className="space-y-3">
            {[
              { t: "Innovation Summit 2026", d: "May 24", r: 184, cap: 300 },
              { t: "Hack Night Vol. 3", d: "June 02", r: 56, cap: 80 },
              { t: "Tech Talk: AI in Education", d: "June 14", r: 92, cap: 150 },
            ].map((e) => (
              <div key={e.t} className="rounded-2xl bg-secondary/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{e.t}</p>
                  <Badge>{e.d}</Badge>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                  <div className="h-full bg-gradient-gold" style={{ width: `${(e.r/e.cap)*100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.r} / {e.cap} RSVPs</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Announcements + Activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Latest announcements" action={<Link to="/leader/announcements" className="text-xs font-semibold text-primary">New post</Link>}>
          <div className="space-y-3">
            {[
              { t: "Officer elections opening soon", d: "Posted 2h ago · 312 reads" },
              { t: "Reminder: Submit your committee reports", d: "Posted yesterday · 248 reads" },
            ].map((a) => (
              <div key={a.t} className="rounded-2xl bg-secondary/60 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold"><Megaphone className="h-4 w-4 text-primary" /> {a.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.d}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent activity">
          <ul className="space-y-3 text-sm">
            {[
              "Marvin Lim applied to join",
              "RSVP confirmed for Hack Night Vol. 3",
              "Officer Anna Sy posted an announcement",
              "Event 'AI in Education' published",
              "Adviser Prof. Tan approved budget request",
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-secondary/40 p-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span className="flex-1">{a}</span>
                <span className="text-xs text-muted-foreground">{i + 1}h</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
