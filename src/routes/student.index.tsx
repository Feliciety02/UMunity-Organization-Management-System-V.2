import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, StatCard, Panel, Badge, LineSpark, Avatar } from "@/components/dashboard/DashboardLayout";
import { organizations, events } from "@/data/site";
import { Users, Calendar, Bell, Bookmark, Sparkles, ArrowRight, CheckCircle2, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const myOrgs = organizations.slice(0, 3);
  const recommended = organizations.slice(3, 6);
  const upcoming = events.slice(0, 3);

  return (
    <>
      <PageHead
        title="Hi Althea 👋"
        sub="Here's what's happening across your campus communities."
        action={
          <Link to="/student/explore" className="inline-flex items-center gap-2 rounded-full bg-gradient-maroon px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105">
            Discover orgs <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Joined orgs" value="3" delta="+1 this month" icon={Users} tone="primary" />
        <StatCard label="Upcoming events" value="5" delta="2 this week" icon={Calendar} tone="gold" />
        <StatCard label="Unread notifs" value="4" icon={Bell} tone="rose" />
        <StatCard label="Saved events" value="7" icon={Bookmark} tone="emerald" />
      </div>

      {/* Bento */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Profile completion" className="lg:col-span-1">
          <div className="relative grid place-items-center">
            <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary)" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(75 / 100) * 314} 314`} />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--gold)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <p className="font-display text-3xl font-bold">75%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Basic info</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> UM email verified</li>
            <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Add interests</li>
            <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Profile photo</li>
          </ul>
        </Panel>

        <Panel title="Engagement (last 8 weeks)" className="lg:col-span-2">
          <LineSpark data={[3, 5, 4, 7, 6, 9, 11, 14]} />
          <p className="mt-3 text-xs text-muted-foreground">You're more active than 82% of students this semester. Keep it up! 🌟</p>
        </Panel>
      </div>

      {/* My orgs + recommended */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Joined organizations" action={<Link to="/student/my-orgs" className="text-xs font-semibold text-primary">View all</Link>}>
          <div className="space-y-3">
            {myOrgs.map((o) => (
              <div key={o.name} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3 transition hover:bg-secondary">
                <Avatar name={o.name.replace("UM ", "")} color={o.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.category} · {o.members} members</p>
                </div>
                <Badge tone="success">Active</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recommended for you" action={<Sparkles className="h-4 w-4 text-gold" />}>
          <div className="space-y-3">
            {recommended.map((o) => (
              <div key={o.name} className="flex items-center gap-3 rounded-2xl bg-card p-3 transition hover:bg-secondary">
                <Avatar name={o.name.replace("UM ", "")} color={o.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.category}</p>
                </div>
                <button className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary-deep">Join</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Upcoming events */}
      <div className="mt-6">
        <Panel title="Upcoming events & RSVPs" action={<Link to="/student/events" className="text-xs font-semibold text-primary">See calendar</Link>}>
          <div className="grid gap-3 md:grid-cols-3">
            {upcoming.map((e, i) => (
              <div key={e.title} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={i === 0 ? "success" : i === 1 ? "warning" : "info"}>{i === 0 ? "Confirmed" : i === 1 ? "Saved" : "Open"}</Badge>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </div>
                <p className="mt-3 font-display text-sm font-bold leading-tight">{e.title}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {e.venue}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Attendance history */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Application status">
          <div className="space-y-3">
            {[
              { name: "UM Debate Council", status: "Under Review", tone: "warning" as const },
              { name: "UM Theatre Guild", status: "Approved", tone: "success" as const },
              { name: "UM Eco Warriors", status: "Approved", tone: "success" as const },
            ].map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                <p className="text-sm font-medium">{a.name}</p>
                <Badge tone={a.tone}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Attendance history">
          <div className="space-y-3">
            {[
              { e: "Welcome Mixer 2026", date: "Apr 12", status: "Attended" },
              { e: "Coding Bootcamp Day 1", date: "Apr 22", status: "Attended" },
              { e: "Eco Cleanup Drive", date: "May 02", status: "Attended" },
              { e: "Org Fair 2026", date: "May 06", status: "Missed" },
            ].map((a) => (
              <div key={a.e} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{a.e}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
                <Badge tone={a.status === "Attended" ? "success" : "danger"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
