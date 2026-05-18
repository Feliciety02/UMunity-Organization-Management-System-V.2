import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ImageIcon, PenSquare, Sparkles, Vote } from "lucide-react";
import { PageHead, Panel, Badge, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { EventCard } from "@/components/events/event-card";
import { PostCard } from "@/components/social/PostCard";
import { Composer } from "@/components/social/composer";
import { OrgSuggestionCard } from "@/components/social/org-suggestion-card";
import { organizations, events, posts } from "@/data/site";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { useDashboardPageLoading } from "@/lib/feedback";

export const Route = createFileRoute("/student/")({
  component: StudentFeed,
});

const feedTabs = ["All", "Following", "Events"] as const;

function StudentFeed() {
  const loading = useDashboardPageLoading();
  const orgBySlug = Object.fromEntries(organizations.map((o) => [o.slug, o]));
  const upcoming = events.slice(0, 3);
  const recommended = organizations.slice(3, 6);

  if (loading) {
    return (
      <>
        <PageHead title="Home feed" sub="Loading the latest activity from your campus community." />
        <div className="mx-auto max-w-[1520px]">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_380px]">
            <div className="space-y-6">
              <PanelSkeleton rows={3} />
              <PanelSkeleton rows={5} />
              <PanelSkeleton rows={5} />
            </div>
            <div className="space-y-6">
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={4} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Home feed" sub="See the latest updates from your organizations and campus community." />

      <div className="mx-auto max-w-[1520px]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_380px]">
          <div className="min-w-0 space-y-6">
            <Composer
              initials="AD"
              prompt="Share an update, event, or question with your campus community..."
              ctaTo="/student/explore"
              actions={[
                { label: "Create post", icon: PenSquare },
                { label: "Event", icon: Calendar },
                { label: "Poll", icon: Vote },
                { label: "Photo", icon: ImageIcon },
              ]}
            />

            <AppTabs items={feedTabs} value="All" onChange={() => undefined} />

            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} org={orgBySlug[post.orgSlug]} orgLinkMode="student" />
              ))}
            </div>
          </div>

          <aside className="min-w-0">
            <div className="space-y-6 xl:sticky xl:top-24">
              <Panel
                title="Upcoming events"
                action={<Link to="/student/events" className="text-sm font-semibold text-primary">View all</Link>}
                className="rounded-[28px] bg-card/96 p-6"
              >
                <div className="space-y-4">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.title}
                      event={event}
                      cover={eventVisuals[event.title] ?? defaultEventVisual}
                      compact
                      badge={<Badge tone={event.status === "Open" ? "success" : event.status === "Soon" ? "info" : "warning"}>{event.status}</Badge>}
                    />
                  ))}
                </div>

                <AppButton asChild variant="secondary" className="mt-5 w-full">
                  <Link to="/student/events">View all events</Link>
                </AppButton>
              </Panel>

              <Panel
                title="Suggested for you"
                action={<Sparkles className="h-4 w-4 text-gold" />}
                className="rounded-[28px] bg-card/96 p-6"
              >
                <div className="space-y-4">
                  {recommended.map((org, index) => (
                    <OrgSuggestionCard
                      key={org.slug}
                      org={org}
                      coverTone={suggestedCoverTones[index % suggestedCoverTones.length]}
                      reason={suggestedReasons[org.slug] ?? "Shared interests in campus events and student communities."}
                      orgLinkMode="student"
                    />
                  ))}
                </div>

                <AppButton asChild variant="secondary" className="mt-5 w-full">
                  <Link to="/student/explore">See more organizations</Link>
                </AppButton>
              </Panel>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const eventVisuals: Record<string, string> = {
  [events[0].title]: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420">
      <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4b0014"/><stop offset="100%" stop-color="#c33652"/></linearGradient></defs>
      <rect width="1200" height="420" fill="url(#a)"/><ellipse cx="840" cy="40" rx="320" ry="150" fill="#ffd29f" opacity="0.22"/>
      <path d="M0 320 C170 250 360 340 540 305 C760 262 910 356 1200 280 L1200 420 L0 420 Z" fill="#130105"/>
    </svg>
  `),
  [events[1].title]: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420">
      <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#193d1f"/><stop offset="100%" stop-color="#9fd45b"/></linearGradient></defs>
      <rect width="1200" height="420" fill="url(#a)"/><circle cx="920" cy="80" r="120" fill="#fff6c0" opacity="0.3"/>
      <circle cx="620" cy="220" r="70" fill="#4fb662"/><path d="M580 205 C600 175 660 178 688 196 C666 230 666 255 686 280 C642 282 608 270 587 248 C576 236 574 219 580 205 Z" fill="#2f79b7"/>
    </svg>
  `),
  [events[2].title]: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420">
      <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a100d"/><stop offset="100%" stop-color="#9b744c"/></linearGradient></defs>
      <rect width="1200" height="420" fill="url(#a)"/><ellipse cx="780" cy="70" rx="260" ry="130" fill="#f4d8a7" opacity="0.24"/>
      <rect y="320" width="1200" height="100" fill="#1b120f"/><rect x="760" y="120" width="74" height="140" fill="#432d21"/><rect x="724" y="148" width="146" height="18" fill="#5c3c2d"/>
    </svg>
  `),
};

const defaultEventVisual = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420">
    <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f4efe5"/><stop offset="100%" stop-color="#efe7da"/></linearGradient></defs>
    <rect width="1200" height="420" fill="url(#a)"/><circle cx="930" cy="90" r="120" fill="#7A0019" opacity="0.08"/>
  </svg>
`);

const suggestedCoverTones = [
  "from-rose-100 via-amber-50 to-white",
  "from-emerald-100 via-lime-50 to-white",
  "from-sky-100 via-orange-50 to-white",
];

const suggestedReasons: Record<string, string> = {
  "theatre-guild": "Because you engage with arts events and student showcases.",
  "student-council": "Recommended for active students interested in campus leadership.",
  athletics: "A match for students following large campus events and team activities.",
};
