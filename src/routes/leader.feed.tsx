import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Newspaper, PenSquare } from "lucide-react";
import { PageHead, Panel, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { PostCard } from "@/components/social/PostCard";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { organizations, posts } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";

export const Route = createFileRoute("/leader/feed")({
  component: LeaderFeed,
});

const tabs = ["All", "Announcements", "Events", "Members only"] as const;

function LeaderFeed() {
  const loading = useDashboardPageLoading();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const org = organizations.find((o) => o.slug === "cs-society") ?? organizations[0];

  const visible = useMemo(() => {
    const mine = posts.filter((p) => p.orgSlug === org.slug);
    if (tab === "Announcements") return mine.filter((p) => p.type === "announcement");
    if (tab === "Events") return mine.filter((p) => p.type === "event");
    if (tab === "Members only") return mine.filter((p) => p.visibility === "members");
    return mine;
  }, [org.slug, tab]);

  if (loading) {
    return (
      <>
        <PageHead title="Organization Feed" sub="Loading your organization's posts." />
        <div className="mx-auto max-w-2xl space-y-4">
          <PanelSkeleton rows={4} />
          <PanelSkeleton rows={4} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Organization Feed"
        sub="Your organization's live posts, exactly as members see them."
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary" size="md">
              <Link to="/leader/preview">
                <Eye className="h-4 w-4" /> Public preview
              </Link>
            </AppButton>
            <AppButton asChild variant="primary" size="md">
              <Link to="/leader/create-post">
                <PenSquare className="h-4 w-4" /> Create post
              </Link>
            </AppButton>
          </div>
        }
      />
      <div className="mx-auto max-w-2xl space-y-4">
        <AppTabs items={tabs} value={tab} onChange={setTab} />
        {visible.length === 0 ? (
          <Panel>
            <EmptyState
              icon={Newspaper}
              title="Nothing here yet"
              sub="Posts approved through the publishing workflow show up in this feed."
              action={
                <AppButton asChild variant="primary" size="sm">
                  <Link to="/leader/create-post">Create post</Link>
                </AppButton>
              }
            />
          </Panel>
        ) : (
          visible.map((post) => <PostCard key={post.id} post={post} org={org} manage orgLinkMode="leader" />)
        )}
      </div>
    </>
  );
}
