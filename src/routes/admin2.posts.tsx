import { createFileRoute, Link } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { usePostApprovals } from "@/lib/post-approvals";
import { ArrowRight, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin2/posts")({
  component: Admin2PostsPage,
});

function Admin2PostsPage() {
  const approvals = usePostApprovals().filter((approval) => approval.status === "pending_admin2");

  return (
    <>
      <PageHead title="Post publishing queue" sub="Clear adviser-approved posts for final publishing." />
      <Panel>
        {approvals.length === 0 ? (
          <EmptyState title="No posts pending Admin 2 review" sub="Adviser-cleared posts will appear here next." icon={Megaphone} />
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
                  <Link to="/admin2/posts/$approvalId" params={{ approvalId: approval.id }}>
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
