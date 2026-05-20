import { createFileRoute } from "@tanstack/react-router";
import { PostApprovalDetail } from "@/components/workflows/PostApprovalDetail";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { usePostApproval } from "@/lib/post-approvals";

export const Route = createFileRoute("/admin2/posts/$approvalId")({
  component: Admin2PostApprovalPage,
});

function Admin2PostApprovalPage() {
  const { approvalId } = Route.useParams();
  const approval = usePostApproval(approvalId);
  const session = getSession();

  if (!approval || !session) {
    return (
      <>
        <PageHead title="Post approval not found" sub="The requested post approval could not be found." />
        <Panel>
          <p className="text-sm text-muted-foreground">Return to the Admin 2 post queue and try again.</p>
        </Panel>
      </>
    );
  }

  return (
    <PostApprovalDetail
      approval={approval}
      viewer={{ role: "admin2", name: session.name }}
      backTo="/admin2/posts"
      backLabel="Post queue"
    />
  );
}
