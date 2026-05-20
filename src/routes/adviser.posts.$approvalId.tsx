import { createFileRoute } from "@tanstack/react-router";
import { PostApprovalDetail } from "@/components/workflows/PostApprovalDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { usePostApproval } from "@/lib/post-approvals";

export const Route = createFileRoute("/adviser/posts/$approvalId")({
  component: AdviserPostApprovalPage,
});

function AdviserPostApprovalPage() {
  const { approvalId } = Route.useParams();
  const approval = usePostApproval(approvalId);
  const session = getSession();

  if (!approval || !session) {
    return (
      <>
        <PageHead title="Post approval not found" sub="The requested post approval could not be found." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the adviser post queue and try again.</p>
        </Panel>
      </>
    );
  }

  return (
    <PostApprovalDetail
      approval={approval}
      viewer={{ role: "adviser", name: session.name }}
      backTo="/adviser/posts"
      backLabel="Post queue"
    />
  );
}
