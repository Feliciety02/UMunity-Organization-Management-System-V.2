import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, EmptyState } from "@/components/dashboard/DashboardLayout";
import { posts, organizations } from "@/data/site";
import { PostCard } from "@/components/social/PostCard";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/student/saved")({
  component: Saved,
});

function Saved() {
  const orgBySlug = Object.fromEntries(organizations.map((o) => [o.slug, o]));
  const saved = posts.slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHead title="Saved posts" sub="Things you bookmarked for later." />
      {saved.length === 0 ? (
        <Panel><EmptyState icon={Bookmark} title="Nothing saved yet" sub="Tap the bookmark icon on any post to save it here." /></Panel>
      ) : (
        saved.map((p) => <PostCard key={p.id} post={p} org={orgBySlug[p.orgSlug]} orgLinkMode="student" />)
      )}
      <p className="text-center text-xs text-muted-foreground">
        <Link to="/student" className="font-semibold text-primary">Back to feed</Link>
      </p>
    </div>
  );
}
