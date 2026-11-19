import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MessageSquare, Users } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState } from "@/components/dashboard/DashboardLayout";
import { JoinOrgButton } from "@/components/org/JoinOrgButton";
import { OrgAvatar } from "@/components/social/PostCard";
import { AppButton } from "@/components/ui/app-button";
import { events, organizations, posts } from "@/data/site";
import { cancelMembershipRequest, useMemberships } from "@/lib/memberships";
import { showStatusToast } from "@/lib/feedback";
import { useThreads } from "@/lib/messages";

export const Route = createFileRoute("/student/my-orgs")({
  component: MyOrgs,
});

function MyOrgs() {
  const memberships = useMemberships();
  const threads = useThreads();
  const my = organizations.filter((o) => memberships.member[o.slug]);
  const pending = organizations.filter((o) => memberships.pending[o.slug]);

  return (
    <>
      <PageHead
        title="My organizations"
        sub={`You belong to ${my.length} ${my.length === 1 ? "community" : "communities"}.`}
        action={
          <AppButton asChild variant="primary" size="md">
            <Link to="/student/explore">
              <Compass className="h-4 w-4" /> Find more
            </Link>
          </AppButton>
        }
      />

      {my.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Users}
            title="You haven't joined any organizations yet"
            sub="Explore campus communities and send a membership request."
            action={
              <AppButton asChild variant="primary" size="sm">
                <Link to="/student/explore">Explore organizations</Link>
              </AppButton>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {my.map((o) => {
            const stats = [
              [String(events.filter((e) => e.host === o.name).length), "Events"],
              [String(posts.filter((p) => p.orgSlug === o.slug).length), "Posts"],
              [o.members.toLocaleString(), "Members"],
            ];
            const thread = threads.find((t) => t.orgSlug === o.slug);
            return (
              <div
                key={o.slug}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <OrgAvatar org={o} size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-bold">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.category} · Member since {memberships.member[o.slug]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="success">Active member</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {stats.map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-secondary/60 p-3">
                      <p className="font-display text-lg font-bold">{v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AppButton asChild variant="primary" size="md" className="min-w-[160px] flex-1">
                    <Link to="/student/org/$slug" params={{ slug: o.slug }}>
                      View org
                    </Link>
                  </AppButton>
                  <AppButton asChild variant="secondary" size="md">
                    <Link to="/student/messages" aria-label={`Message ${o.name}`}>
                      <MessageSquare className="h-4 w-4" />
                      {thread ? "Messages" : "Message"}
                    </Link>
                  </AppButton>
                  <JoinOrgButton slug={o.slug} orgName={o.name} size="md" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 mt-10 font-display text-lg font-bold">Pending requests</h2>
      <Panel>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending membership requests.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <div
                key={o.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <OrgAvatar org={o} size={40} />
                  <div>
                    <Link
                      to="/student/org/$slug"
                      params={{ slug: o.slug }}
                      className="text-sm font-semibold hover:underline"
                    >
                      {o.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {o.category} · Requested {memberships.pending[o.slug]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warning">Under review</Badge>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      cancelMembershipRequest(o.slug);
                      showStatusToast(
                        "Request withdrawn",
                        `Your request to join ${o.name} was withdrawn.`,
                        "info",
                      );
                    }}
                  >
                    Withdraw
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
