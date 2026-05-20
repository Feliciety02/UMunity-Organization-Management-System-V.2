import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, EmptyState, Badge } from "@/components/dashboard/DashboardLayout";
import { posts, organizations } from "@/data/site";
import { PostCard } from "@/components/social/PostCard";
import { AppButton } from "@/components/ui/app-button";
import { PenSquare, Clock3, CheckCircle2 } from "lucide-react";
import { formatPostApprovalStatus, postApprovalTone, usePostApprovals } from "@/lib/post-approvals";

export const Route = createFileRoute("/leader/posts")({
  component: ManagePosts,
});

function ManagePosts() {
  const org = organizations[0];
  const approvals = usePostApprovals().filter((approval) => approval.orgSlug === org.slug);
  const published = approvals.filter((approval) => approval.status === "published");
  const pending = approvals.filter((approval) => approval.status !== "published");
  const myPosts = posts.filter((post) => post.orgSlug === org.slug);

  return (
    <>
      <PageHead
        title="Manage posts"
        sub="Track content approvals, drafts, and live posts from one place."
        action={
          <Link to="/leader/create-post" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
            <PenSquare className="h-3.5 w-3.5" /> New post
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Panel title="Approval queue">
            {approvals.length === 0 ? (
              <EmptyState
                title="No post workflows yet"
                sub="Create your first update and route it through adviser review."
                icon={PenSquare}
                action={
                  <AppButton asChild variant="primary" size="sm">
                    <Link to="/leader/create-post">Create a post</Link>
                  </AppButton>
                }
              />
            ) : (
              <div className="space-y-3">
                {approvals.map((approval) => (
                  <div key={approval.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Badge tone={postApprovalTone(approval.status)}>{formatPostApprovalStatus(approval.status)}</Badge>
                      <Badge tone="info">{approval.type}</Badge>
                      <Badge tone="neutral">{approval.visibility}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{approval.title || "Untitled post"}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{approval.content}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AppButton asChild variant="secondary" size="sm">
                        <Link to="/leader/post-approvals/$approvalId" params={{ approvalId: approval.id }}>
                          Open workflow
                        </Link>
                      </AppButton>
                      {approval.status === "published" ? <Badge tone="success">Ready in workflow system</Badge> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {myPosts.length > 0 && (
            <Panel title="Current live feed posts">
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <PostCard key={post.id} post={post} org={org} manage orgLinkMode="leader" />
                ))}
              </div>
            </Panel>
          )}
        </div>
        <aside className="space-y-4">
          <Panel title="At a glance">
            <ul className="space-y-2 text-sm">
              <Row label="Pending adviser" value={String(pending.filter((item) => item.status === "pending_adviser").length)} icon={Clock3} />
              <Row label="Pending Admin 2" value={String(pending.filter((item) => item.status === "pending_admin2").length)} icon={Clock3} />
              <Row label="Published approvals" value={String(published.length)} icon={CheckCircle2} />
              <Row label="Legacy live posts" value={String(myPosts.length)} icon={PenSquare} />
            </ul>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: typeof PenSquare }) {
  return (
    <li className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="inline-flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
