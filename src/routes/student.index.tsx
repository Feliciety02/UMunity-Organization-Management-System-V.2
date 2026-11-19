import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, Compass, MessageSquare, Newspaper, Sparkles } from "lucide-react";
import {
  PageHead,
  Panel,
  Badge,
  EmptyState,
  PanelSkeleton,
} from "@/components/dashboard/DashboardLayout";
import { defaultEventCover, eventCovers } from "@/components/events/event-covers";
import { EventCard } from "@/components/events/event-card";
import { PostCard } from "@/components/social/PostCard";
import { Composer } from "@/components/social/composer";
import { OrgSuggestionCard } from "@/components/social/org-suggestion-card";
import { organizations, events, posts } from "@/data/site";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { useDashboardPageLoading } from "@/lib/feedback";
import { getSession } from "@/lib/auth";
import { useMemberships } from "@/lib/memberships";

export const Route = createFileRoute("/student/")({
  component: StudentFeed,
});

const feedTabs = ["All", "Following", "Events"] as const;

function StudentFeed() {
  const loading = useDashboardPageLoading();
  const [tab, setTab] = useState<(typeof feedTabs)[number]>("All");
  const memberships = useMemberships();
  const orgBySlug = Object.fromEntries(organizations.map((o) => [o.slug, o]));
  const upcoming = events.slice(0, 3);
  const recommended = organizations
    .filter((o) => !memberships.member[o.slug] && !memberships.pending[o.slug])
    .slice(0, 3);
  const session = getSession();
  const initials = (session?.name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const visiblePosts = useMemo(() => {
    if (tab === "Following") return posts.filter((p) => Boolean(memberships.member[p.orgSlug]));
    if (tab === "Events") return posts.filter((p) => p.type === "event");
    return posts;
  }, [tab, memberships]);

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
      <PageHead
        title="Home feed"
        sub="See the latest updates from your organizations and campus community."
      />

      <div className="mx-auto max-w-[1520px]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_380px]">
          <div className="min-w-0 space-y-6">
            <Composer
              initials={initials}
              prompt="Looking for something? Find organizations, events, and people on campus..."
              ctaTo="/student/explore"
              actions={[
                { label: "Explore orgs", icon: Compass, to: "/student/explore" },
                { label: "Events", icon: Calendar, to: "/student/events" },
                { label: "Messages", icon: MessageSquare, to: "/student/messages" },
              ]}
            />

            <AppTabs items={feedTabs} value={tab} onChange={setTab} />

            <div className="space-y-5">
              {visiblePosts.length === 0 ? (
                <Panel>
                  <EmptyState
                    icon={Newspaper}
                    title={
                      tab === "Following"
                        ? "No posts from your organizations yet"
                        : "No event posts yet"
                    }
                    sub="Join more organizations to fill your feed."
                    action={
                      <AppButton asChild variant="primary" size="sm">
                        <Link to="/student/explore">Explore organizations</Link>
                      </AppButton>
                    }
                  />
                </Panel>
              ) : (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    org={orgBySlug[post.orgSlug]}
                    orgLinkMode="student"
                  />
                ))
              )}
            </div>
          </div>

          <aside className="min-w-0">
            <div className="space-y-6 xl:sticky xl:top-24">
              <Panel
                title="Upcoming events"
                action={
                  <Link
                    to="/student/events"
                    search={{ event: undefined }}
                    className="text-sm font-semibold text-primary"
                  >
                    View all
                  </Link>
                }
                className="rounded-[28px] bg-card/96 p-6"
              >
                <div className="space-y-4">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.title}
                      event={event}
                      cover={eventCovers[event.title] ?? defaultEventCover}
                      compact
                      badge={
                        <Badge
                          tone={
                            event.status === "Open"
                              ? "success"
                              : event.status === "Soon"
                                ? "info"
                                : "warning"
                          }
                        >
                          {event.status}
                        </Badge>
                      }
                    />
                  ))}
                </div>

                <AppButton asChild variant="secondary" className="mt-5 w-full">
                  <Link to="/student/events" search={{ event: undefined }}>
                    View all events
                  </Link>
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
                      reason={
                        suggestedReasons[org.slug] ??
                        "Shared interests in campus events and student communities."
                      }
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

const suggestedCoverTones = [
  "from-rose-100 via-primary/40 to-card",
  "from-emerald-100 via-lime-50 to-card",
  "from-sky-100 via-orange-50 to-card",
];

const suggestedReasons: Record<string, string> = {
  "theatre-guild": "Because you engage with arts events and student showcases.",
  "student-council": "Recommended for active students interested in campus leadership.",
  athletics: "A match for students following large campus events and team activities.",
};
