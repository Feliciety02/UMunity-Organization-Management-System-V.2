import { createFileRoute, Link } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { usePostApprovals } from "@/lib/post-approvals";
import { ArrowRight, Megaphone } from "lucide-react";

export const Route = createFileRoute("/adviser/posts")({
  component: AdviserPostsPage,
});

function AdviserPostsPage() {
  const approvals = usePostApprovals().filter((approval) => approval.status === "pending_adviser");

  return (
    <>
      <PageHead title="Post approval queue" sub="Review organization posts before they become publishable." />
      <Panel>
        {approvals.length === 0 ? (
          <EmptyState title="No posts pending adviser review" sub="Leader submissions will appear here first." icon={Megaphone} />
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => (
              <div key={approval.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="info">{approval.type}</Badge>
                  <Badge tone="neutral">{approval.visibility}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{approval.title || "Untitled post"}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{approval.content}</p>
                <AppButton asChild variant="secondary" size="sm" className="mt-3">
                  <Link to="/adviser/posts/$approvalId" params={{ approvalId: approval.id }}>
                    Review post <ArrowRight className="h-4 w-4" />
                  </Link>
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
