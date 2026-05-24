import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MessageSquare, RotateCcw, Workflow } from "lucide-react";
import { PageHead, StatCard } from "@/components/dashboard/DashboardLayout";
import { ReviewActivityFeed, ReviewCenterBoard } from "@/components/workflows/ReviewCenterBoard";
import { getSession } from "@/lib/auth";
import { useLeaderReviewCenter } from "@/lib/review-center";

export const Route = createFileRoute("/leader/revisions")({
  component: LeaderRevisionsPage,
});

function LeaderRevisionsPage() {
  const session = getSession();
  const center = useLeaderReviewCenter(session?.org);

  return (
    <>
      <PageHead title="Revision center" sub="One place to reopen submissions, see reviewer notes, and clear blockers across every workflow lane." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Revisions waiting" value={`${center.revisionCount}`} delta="Across workflows, posts, accreditation, transitions, and trackers" icon={RotateCcw} tone="rose" />
        <StatCard label="Recent review notes" value={`${center.recentCommentCount}`} delta="Latest adviser and admin feedback across your org" icon={MessageSquare} tone="primary" />
        <StatCard label="Action lanes" value="5" delta="Event workflows, closeouts, posts, accreditation, and transition records" icon={Workflow} tone="gold" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ReviewCenterBoard
          title="Needs your updates"
          emptyTitle="No revisions waiting"
          emptySub="Your active submissions are clear right now."
          items={center.actionItems}
        />
        <ReviewActivityFeed title="Recent reviewer notes" empty="New reviewer comments will appear here as workflows move." items={center.recentActivity} />
      </div>
      <div className="mt-6">
        <StatCard label="Review posture" value={center.revisionCount === 0 ? "Clear" : "Blocked"} delta={center.revisionCount === 0 ? "No active revision requests" : "Open each item and resolve reviewer guidance"} icon={AlertTriangle} tone={center.revisionCount === 0 ? "emerald" : "rose"} />
      </div>
    </>
  );
}
