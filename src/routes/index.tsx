import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { organizations, events, stats } from "@/data/site";
import { ArrowRight, Users, Calendar, Megaphone, BarChart3, Bell, LayoutDashboard, Sparkles, Search, UserPlus, Rocket, Star, Quote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UMUnity — One Platform for Every Student Organization" },
      { name: "description", content: "Discover organizations, join communities, manage events, and stay connected across the University of Mindanao." },
      { property: "og:title", content: "UMUnity — One Platform for Every Student Organization" },
      { property: "og:description", content: "The premium campus platform for UM student organizations." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-95" />
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl animate-float" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-28 sm:px-6 lg:pt-28 lg:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-gold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Built for the University of Mindanao
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                One Platform for{" "}
                <span className="text-gradient-gold">Every Student Organization.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
                Discover organizations, join communities, manage events, and stay connected across the University of Mindanao.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/organizations" className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-deep shadow-soft transition-transform hover:scale-105">
                  Explore Organizations
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20">
                  Get Started
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4 text-primary-foreground/80">
                <div className="flex -space-x-3">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`h-9 w-9 rounded-full border-2 border-primary-deep bg-gradient-to-br ${["from-gold to-amber-600","from-rose-400 to-primary","from-emerald-400 to-primary-deep","from-gold-warm to-gold"][i]}`} />
                  ))}
                </div>
                <p className="text-sm">Trusted by <span className="font-semibold text-gold">18,000+</span> Mindanaoan students</p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative animate-fade-up [animation-delay:200ms]">
              <div className="glass-dark relative rounded-3xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold">Live Now</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-primary-foreground">Student Dashboard</h3>
                  </div>
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">3 new</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: Users, label: "Joined UM CS Society", meta: "412 members" },
                    { icon: Calendar, label: "Innovation Summit", meta: "May 24" },
                    { icon: Megaphone, label: "New announcement", meta: "Just now" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition hover:bg-white/10">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-gold text-primary-deep">
                        <r.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-foreground">{r.label}</p>
                        <p className="text-xs text-primary-foreground/60">{r.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[["12","Orgs"],["7","Events"],["4","Posts"]].map(([v,l]) => (
                    <div key={l} className="rounded-2xl border border-gold/20 bg-white/5 p-3 text-center">
                      <div className="font-display text-xl font-bold text-gold">{v}</div>
                      <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-gradient-gold p-4 shadow-soft animate-float sm:block">
                <div className="flex items-center gap-2 text-primary-deep">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">98% Student Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative -mt-12 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 rounded-3xl bg-card p-6 shadow-soft md:grid-cols-4 md:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-gradient-maroon md:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ORGS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeader eyebrow="Featured Organizations" title="Find your people." sub="Browse highlight communities making waves on campus." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.slice(0, 6).map((o) => (
            <OrgCard key={o.name} {...o} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/organizations" className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
            View all organizations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <SectionHeader eyebrow="Upcoming Events" title="Don't miss what's next." sub="From summits to sportsfest, your campus calendar lives here." />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((e) => (
              <EventCard key={e.title} {...e} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-gradient-maroon px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105">
              See all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeader eyebrow="The Platform" title="Everything campus life needs." sub="Powerful tools for students, leaders, and administrators — all in one place." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, t: "Organization Discovery", d: "Browse and filter every recognized UM organization in seconds." },
            { icon: UserPlus, t: "Membership Applications", d: "Apply, track status, and onboard — no paperwork required." },
            { icon: Calendar, t: "Event Management", d: "Plan, publish, and manage events with built-in RSVP." },
            { icon: Bell, t: "Smart Notifications", d: "Get real-time updates on orgs, events, and announcements." },
            { icon: LayoutDashboard, t: "Role Dashboards", d: "Tailored experiences for students, leaders, and admins." },
            { icon: BarChart3, t: "Reports & Analytics", d: "Insights into engagement, attendance, and growth." },
          ].map((f) => (
            <div key={t_(f)} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/30">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/30" />
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-maroon text-gold">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-5 font-display text-lg font-bold">{f.t}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-gradient-maroon py-24 text-primary-foreground">
        <div className="absolute inset-0 opacity-40 bg-hero" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader eyebrow="How it Works" title="Three steps to belong." sub="Joining campus life has never been simpler." light />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", icon: Search, t: "Discover", d: "Browse organizations by category and find ones that match your passions." },
              { n: "02", icon: UserPlus, t: "Join", d: "Apply with one click. Leaders review and welcome you into the community." },
              { n: "03", icon: Rocket, t: "Engage", d: "Attend events, post updates, and grow your network across UM." },
            ].map((s) => (
              <div key={s.n} className="glass-dark relative rounded-3xl p-7">
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-bold text-gold/40">{s.n}</span>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold text-primary-deep">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeader eyebrow="Loved by Students" title="Real voices from campus." sub="UMUnity is shaping how Mindanaoans connect, lead, and grow." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "Althea D.", r: "BS Computer Science • 3rd Year", q: "I joined three orgs in one week. UMUnity completely changed how I experience campus." },
            { n: "Marco R.", r: "President, UM Debate Council", q: "Managing memberships and events used to take days. Now it's minutes — and our team loves it." },
            { n: "Prof. Liana K.", r: "OSA Coordinator", q: "Finally, a single source of truth for every recognized organization at UM." },
          ].map((t) => (
            <div key={t.n} className="relative rounded-3xl border border-border bg-card p-7 shadow-soft">
              <Quote className="h-8 w-8 text-gold" />
              <p className="mt-4 text-foreground/90">{t.q}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-maroon" />
                <div>
                  <p className="font-display text-sm font-bold">{t.n}</p>
                  <p className="text-xs text-muted-foreground">{t.r}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-maroon p-10 text-center text-primary-foreground shadow-soft md:p-16">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-primary/60 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              Your campus journey, <span className="text-gradient-gold">amplified.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of UM students already building their college story on UMUnity.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="rounded-full bg-gradient-gold px-7 py-3 text-sm font-bold text-primary-deep shadow-soft transition-transform hover:scale-105">Create your account</Link>
              <Link to="/organizations" className="rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20">Browse organizations</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function t_(f: { t: string }) { return f.t; }

export function SectionHeader({ eyebrow, title, sub, light }: { eyebrow: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? "text-gold" : "text-primary"}`}>{eyebrow}</span>
      <h2 className={`mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl ${light ? "text-primary-foreground" : ""}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base ${light ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}

export function OrgCard({ name, category, members, desc, color }: { name: string; category: string; members: number; desc: string; color: string }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${color} font-display text-xl font-bold text-primary-foreground shadow-soft`}>
          {name.split(" ").filter(w => w !== "UM").slice(0,2).map(w => w[0]).join("")}
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{category}</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-bold">{name}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> {members} members
        </span>
        <button className="rounded-full bg-gradient-maroon px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105">Join</button>
      </div>
    </div>
  );
}

export function EventCard({ title, date, time, venue, host, status }: { title: string; date: string; time: string; venue: string; host: string; status: string }) {
  const statusColor = status === "Open" ? "bg-emerald-100 text-emerald-700" : status === "Filling Fast" ? "bg-amber-100 text-amber-800" : "bg-secondary text-primary";
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-28 bg-gradient-maroon">
        <div className="absolute inset-0 bg-hero opacity-50" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div className="rounded-2xl bg-white/95 px-3 py-2 text-center shadow-soft">
            <div className="font-display text-lg font-bold leading-none text-primary">{date.split(" ")[1].replace(",", "")}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{date.split(" ")[0]}</div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>{status}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold leading-snug">{title}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">{host}</p>
        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <div>🕐 {time} · {date}</div>
          <div>📍 {venue}</div>
        </div>
        <button className="mt-5 w-full rounded-full bg-gradient-gold py-2.5 text-sm font-semibold text-primary-deep transition-transform hover:scale-[1.02]">RSVP</button>
      </div>
    </div>
  );
}
