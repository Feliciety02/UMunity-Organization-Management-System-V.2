import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { posts, organizations } from "@/data/site";
import { PostCard } from "@/components/social/PostCard";
import { useDashboardPageLoading } from "@/lib/feedback";
import { Bookmark, Compass } from "lucide-react";

export const Route = createFileRoute("/student/saved")({
  component: Saved,
});

function Saved() {
  const loading = useDashboardPageLoading();
  const orgBySlug = Object.fromEntries(organizations.map((o) => [o.slug, o]));
  const saved = posts.slice(0, 2);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <PageHead title="Saved posts" sub="Loading your bookmarked posts." />
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHead title="Saved posts" sub="Things you bookmarked for later." />
      {saved.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            sub="Tap the bookmark icon on any post to save it here."
            action={
              <AppButton asChild variant="primary" size="sm">
                <Link to="/student/explore">
                  <Compass className="h-4 w-4" aria-hidden="true" /> Discover posts
                </Link>
              </AppButton>
            }
          />
        </Panel>
      ) : (
        saved.map((p) => <PostCard key={p.id} post={p} org={orgBySlug[p.orgSlug]} orgLinkMode="student" />)
      )}
      <p className="text-center text-xs text-muted-foreground">
        <Link to="/student" className="font-semibold text-primary">Back to feed</Link>
      </p>
    </div>
  );
}
