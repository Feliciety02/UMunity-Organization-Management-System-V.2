import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { posts, organizations } from "@/data/site";
import { PostCard } from "@/components/social/PostCard";
import { PenSquare } from "lucide-react";

export const Route = createFileRoute("/leader/posts")({
  component: ManagePosts,
});

function ManagePosts() {
  const org = organizations[0];
  const myPosts = posts.filter((p) => p.orgSlug === org.slug);

  return (
    <>
      <PageHead
        title="Manage posts"
        sub="Edit, pin, or remove posts from your organization."
        action={
          <Link to="/leader/create-post" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
            <PenSquare className="h-3.5 w-3.5" /> New post
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {myPosts.length === 0 && (
            <Panel><p className="py-8 text-center text-sm text-muted-foreground">No posts yet. Create your first one.</p></Panel>
          )}
          {myPosts.map((p) => (
            <PostCard key={p.id} post={p} org={org} manage orgLinkMode="leader" />
          ))}
        </div>
        <aside className="space-y-4">
          <Panel title="At a glance">
            <ul className="space-y-2 text-sm">
              <Row label="Total posts" value="24" />
              <Row label="Pinned" value="1" />
              <Row label="Published this month" value="6" />
              <Row label="Drafts" value="2" />
              <Row label="Avg. engagement" value="87%" />
            </ul>
          </Panel>
          <Panel title="Quick filters">
            <div className="flex flex-wrap gap-1.5">
              {["All", "Pinned", "Events", "Announcements", "Drafts"].map((f, i) => (
                <button key={f} className={`rounded-md border border-border px-2.5 py-1 text-xs font-medium ${i === 0 ? "bg-primary/10 text-primary border-primary" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{f}</button>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
