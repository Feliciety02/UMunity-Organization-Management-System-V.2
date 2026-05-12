import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { organizations, events, posts } from "@/data/site";
import { PostCard, OrgAvatar } from "@/components/social/PostCard";
import { Calendar, MapPin, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: StudentFeed,
});

function StudentFeed() {
  const orgBySlug = Object.fromEntries(organizations.map((o) => [o.slug, o]));
  const upcoming = events.slice(0, 3);
  const recommended = organizations.slice(3, 6);

  return (
    <>
      <PageHead title="Home feed" sub="See the latest updates from your organizations and campus community." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">AD</span>
          <div>What's happening on campus, <span className="font-semibold">Althea</span>?</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Following', 'Events', 'Announcements'].map((label) => (
            <button key={label} className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-4">
        {/* Composer prompt */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-soft">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">AD</div>
          <Link
            to="/student/explore"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            What's happening on campus, Althea?
          </Link>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} org={orgBySlug[p.orgSlug]} />
          ))}
        </div>
      </div>

      {/* Right rail */}
      <aside className="space-y-4">
        <Panel title="Upcoming events" action={<Link to="/student/events" className="text-xs font-semibold text-primary">All</Link>}>
          <ul className="space-y-3">
            {upcoming.map((e) => (
              <li key={e.title} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{e.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{e.date}</span> · <MapPin className="h-3 w-3" /> <span className="truncate">{e.venue}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Suggested for you" action={<Sparkles className="h-4 w-4 text-gold" />}>
          <ul className="space-y-3">
            {recommended.map((o) => (
              <li key={o.slug} className="flex items-center gap-3">
                <Link to="/org/$slug" params={{ slug: o.slug }}>
                  <OrgAvatar org={o} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/org/$slug" params={{ slug: o.slug }} className="block truncate text-sm font-semibold hover:underline">{o.name}</Link>
                  <p className="text-xs text-muted-foreground">{o.category} · {o.members}</p>
                </div>
                <button className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Join</button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Trending" action={<TrendingUp className="h-4 w-4 text-primary" />}>
          <ul className="space-y-2 text-sm">
            {["#InnovationSummit", "#PlasticFreeMay", "#BattleOfBards", "#CulturalNight"].map((t) => (
              <li key={t}>
                <Link to="/student/explore" className="block rounded-md px-2 py-1.5 font-medium text-foreground hover:bg-secondary">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="rounded-lg border border-border bg-cream p-4 text-xs text-muted-foreground">
          <Badge tone="gold">Tip</Badge>
          <p className="mt-2 leading-relaxed">Complete your profile to get better org recommendations. <Link to="/student/profile" className="font-semibold text-primary underline">Edit profile</Link></p>
        </div>
      </aside>
    </div>
  </>
  );
}
