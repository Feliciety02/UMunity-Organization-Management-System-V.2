import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, MessageSquare, RotateCcw } from "lucide-react";
import { PageHead, StatCard } from "@/components/dashboard/DashboardLayout";
import { ReviewActivityFeed, ReviewCenterBoard } from "@/components/workflows/ReviewCenterBoard";
import { useReviewerReviewCenter } from "@/lib/review-center";

export const Route = createFileRoute("/adviser/review-center")({
  component: AdviserReviewCenter,
});

function AdviserReviewCenter() {
  const center = useReviewerReviewCenter("adviser");

  return (
    <>
      <PageHead title="Review center" sub="See every adviser-owned queue, recent guidance, and revision context without jumping across separate pages." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending reviews" value={`${center.pendingCount}`} delta="Leader submissions waiting for first-line approval" icon={ClipboardCheck} tone="gold" />
        <StatCard label="Recent guidance" value={`${center.feedbackCount}`} delta="Comments and revision notes left across active lanes" icon={MessageSquare} tone="primary" />
        <StatCard label="Review coverage" value="6" delta="Workflows, closeouts, posts, accreditation, transitions, and trackers" icon={CheckCircle2} tone="emerald" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ReviewCenterBoard
          title="Active adviser queue"
          emptyTitle="No adviser reviews pending"
          emptySub="New leader submissions will appear here once they are routed to adviser review."
          items={center.pendingActionItems}
        />
        <ReviewActivityFeed title="Your recent review notes" empty="Comments and revision notes you leave will appear here." items={center.recentFeedback} />
      </div>
      <div className="mt-6">
        <StatCard label="Revision posture" value={center.feedbackCount > 0 ? "Active" : "Quiet"} delta="Use this center to keep comment-based review inside the workflow system" icon={RotateCcw} tone="rose" />
      </div>
    </>
  );
}
