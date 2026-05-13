import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EventCard as SharedEventCard } from "@/components/events/event-card";
import { defaultEventCover, eventCovers } from "@/components/events/event-covers";
import { organizations, events, stats } from "@/data/site";
import umCampusHero from "@/assets/um-campus-hero.svg";
import {
  ArrowRight,
  Users,
  Calendar,
  Megaphone,
  BarChart3,
  Bell,
  LayoutDashboard,
  Search,
  UserPlus,
  Rocket,
  Star,
  Quote,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

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
    <PageShell overlayHeader>
      <section className="hero-section relative left-1/2 flex min-h-screen w-screen max-w-none -translate-x-1/2 items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${umCampusHero})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(75,0,16,0.92)_0%,rgba(75,0,16,0.78)_36%,rgba(75,0,16,0.44)_68%,rgba(20,6,9,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,199,44,0.18),transparent_30%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.14),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.38),rgba(0,0,0,0.14))]" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[rgba(244,176,0,0.12)] blur-3xl" />
        <div className="absolute bottom-8 right-0 h-80 w-80 rounded-full bg-[rgba(122,0,25,0.24)] blur-3xl" />

        <div className="hero-content relative mx-auto max-w-[1400px] px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_460px] xl:grid-cols-[minmax(0,1.08fr)_520px]">
            <div className="max-w-3xl text-[#FFFDF7]">
              <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.96] tracking-[-0.04em] text-[#FFFDF7] sm:text-6xl lg:text-7xl">
                One Platform for{" "}
                <span className="bg-[linear-gradient(180deg,#FFC72C_0%,#F4B000_100%)] bg-clip-text text-transparent">
                  Every Student Organization.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#FFFDF7]/78 sm:text-xl">
                Discover organizations, join communities, manage events, and stay connected across the University of Mindanao with one student-focused platform.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/organizations"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#F4B000] px-7 py-3.5 text-sm font-semibold text-[#4B0010] shadow-[0_16px_40px_rgba(244,176,0,0.22)] transition hover:bg-[#FFC72C]"
                >
                  Explore Organizations
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-[#FFFDF7] backdrop-blur-lg transition hover:bg-white/16"
                >
                  Learn More
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4 text-[#FFFDF7]/82">
                <div className="flex -space-x-3">
                  {[
                    "from-[#f8d8a7] to-[#b66a4b]",
                    "from-[#f7b8b6] to-[#7A0019]",
                    "from-[#d6e8bf] to-[#496c36]",
                    "from-[#ffe59a] to-[#F4B000]",
                    "from-[#f1d0c7] to-[#7d3f3d]",
                  ].map((tone, index) => (
                    <div
                      key={tone}
                      className={`grid h-11 w-11 place-items-center rounded-full border-2 border-[rgba(255,253,247,0.85)] bg-gradient-to-br ${tone} text-[11px] font-bold text-[#4B0010] shadow-[0_10px_24px_rgba(0,0,0,0.18)]`}
                    >
                      {["AL", "MR", "JS", "KL", "+"][index]}
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-6 sm:text-base">
                  Trusted by <span className="font-semibold text-[#FFC72C]">18,000+</span> Mindanaoan students
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 text-[#FFFDF7] shadow-[0_28px_80px_rgba(18,6,10,0.42)] backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFC72C]">
                      <span className="h-2 w-2 rounded-full bg-[#F4B000]" />
                      Live Now
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold">Student Dashboard</h3>
                  </div>
                  <span className="rounded-full border border-[rgba(255,199,44,0.25)] bg-[rgba(244,176,0,0.14)] px-3 py-1 text-xs font-semibold text-[#FFC72C]">
                    3 new
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Users, label: "Joined UM CS Society", meta: "412 members", time: "2h ago" },
                    { icon: Calendar, label: "Innovation Summit", meta: "May 24, 2026", time: "5h ago" },
                    { icon: Megaphone, label: "New announcement", meta: "Just now", time: "10m ago" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[rgba(255,255,255,0.07)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(180deg,#FFC72C_0%,#F4B000_100%)] text-[#4B0010] shadow-[0_10px_24px_rgba(244,176,0,0.16)]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#FFFDF7]">{item.label}</p>
                        <p className="text-xs text-[#FFFDF7]/64">{item.meta}</p>
                      </div>
                      <span className="text-xs text-[#FFFDF7]/56">{item.time}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    ["12", "Organizations"],
                    ["7", "Events"],
                    ["4", "Posts"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[1.35rem] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-4 text-center"
                    >
                      <div className="font-display text-3xl font-bold text-[#FFC72C]">{value}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFFDF7]/60">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-12 grid gap-3 rounded-[2rem] border border-white/14 bg-[rgba(255,255,255,0.08)] p-3 shadow-[0_20px_50px_rgba(25,7,10,0.32)] backdrop-blur-2xl md:grid-cols-4">
            {[
              {
                title: "Discover",
                text: "Browse recognized organizations by interest, mission, and campus culture.",
                icon: Search,
              },
              {
                title: "Participate",
                text: "Join events, RSVP quickly, and stay updated on what happens next.",
                icon: CheckCircle2,
              },
              {
                title: "Connect",
                text: "Follow communities, receive announcements, and keep conversations moving.",
                icon: MessageSquare,
              },
              {
                title: "Lead",
                text: "Manage members, publish updates, and run your organization with confidence.",
                icon: LayoutDashboard,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.05)] px-5 py-5 text-[#FFFDF7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgba(244,176,0,0.15)] text-[#FFC72C]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#FFFDF7]/68">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-6 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 rounded-[2rem] border border-[rgba(122,0,25,0.08)] bg-[linear-gradient(180deg,rgba(255,253,247,0.98),rgba(255,250,242,0.94))] p-6 shadow-[0_24px_60px_rgba(75,0,16,0.08)] md:grid-cols-4 md:p-8">
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
            <SharedEventCard
              key={e.title}
              event={e}
              cover={eventCovers[e.title] ?? defaultEventCover}
            />
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
