import { createFileRoute } from "@tanstack/react-router";
import { PostApprovalDetail } from "@/components/workflows/PostApprovalDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { usePostApproval } from "@/lib/post-approvals";

export const Route = createFileRoute("/leader/post-approvals/$approvalId")({
  component: LeaderPostApprovalPage,
});

function LeaderPostApprovalPage() {
  const { approvalId } = Route.useParams();
  const approval = usePostApproval(approvalId);
  const session = getSession();

  if (!approval || !session) {
    return (
      <>
        <PageHead title="Post approval not found" sub="The post approval workflow could not be found." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to manage posts and select another item.</p>
        </Panel>
      </>
    );
  }

  return (
    <PostApprovalDetail
      approval={approval}
      viewer={{ role: "leader", name: session.name }}
      backTo="/leader/posts"
      backLabel="Manage posts"
    />
  );
}
