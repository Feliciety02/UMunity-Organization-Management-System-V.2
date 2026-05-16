import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Search, UserPlus, Calendar, Bell, MessageSquare, FileText, Users, BarChart3, Megaphone, Shield, Settings, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — UMunity" },
      { name: "description", content: "Powerful features for students, organization leaders, and admins on the UMunity platform." },
      { property: "og:title", content: "Features — UMunity" },
      { property: "og:description", content: "Powerful features for students, organization leaders, and admins on the UMunity platform." },
    ],
  }),
  component: Features,
});

const groups = [
  {
    label: "For Students",
    color: "from-primary to-primary-deep",
    items: [
      { icon: Search, t: "Organization Discovery", d: "Find your community by category, interest, or college." },
      { icon: UserPlus, t: "Membership Applications", d: "One-click apply. Track every status in real time." },
      { icon: Calendar, t: "RSVP System", d: "Reserve your spot at events with a tap." },
      { icon: Bell, t: "Notifications", d: "Never miss an update from your orgs." },
      { icon: LayoutDashboard, t: "Student Dashboard", d: "All your memberships, events, and posts in one view." },
      { icon: MessageSquare, t: "Community Feed", d: "Stay in the loop with announcements and discussions." },
    ],
  },
  {
    label: "For Organization Leaders",
    color: "from-amber-600 to-primary",
    items: [
      { icon: Users, t: "Member Management", d: "Approve, organize, and engage your members effortlessly." },
      { icon: Calendar, t: "Event Management", d: "Create, publish, and run events with built-in RSVP." },
      { icon: Megaphone, t: "Announcements", d: "Broadcast updates instantly to members." },
      { icon: FileText, t: "Application Reviews", d: "Vet incoming applicants with a clean workflow." },
      { icon: LayoutDashboard, t: "Leader Dashboard", d: "Track health metrics for your organization." },
      { icon: BarChart3, t: "Engagement Reports", d: "Understand attendance and growth patterns." },
    ],
  },
  {
    label: "For Admins",
    color: "from-primary-deep to-rose-700",
    items: [
      { icon: Shield, t: "Org Verification", d: "Recognize and manage every official UM organization." },
      { icon: BarChart3, t: "Platform Analytics", d: "Campus-wide insights on engagement and activity." },
      { icon: Settings, t: "System Controls", d: "Configure roles, permissions, and policies." },
      { icon: FileText, t: "Reports", d: "Generate exportable reports for OSA and stakeholders." },
      { icon: Megaphone, t: "Global Announcements", d: "Communicate university-wide initiatives." },
      { icon: Users, t: "User Management", d: "Oversee accounts, roles, and access at scale." },
    ],
  },
];

function Features() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-maroon py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold md:text-6xl">
            Built for <span className="text-gradient-gold">every role.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Whether you're discovering, leading, or governing — UMunity has you covered.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="space-y-20">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-1.5 rounded-full bg-gradient-to-b ${g.color}`} />
                <h2 className="font-display text-3xl font-bold md:text-4xl">{g.label}</h2>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it) => (
                  <div key={it.t} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/30">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/30" />
                    <div className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.color} text-gold`}>
                      <it.icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-5 font-display text-lg font-bold">{it.t}</h3>
                    <p className="relative mt-2 text-sm text-muted-foreground">{it.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
