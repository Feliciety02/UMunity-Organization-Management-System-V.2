import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, MessageSquare, ShieldAlert } from "lucide-react";
import { PageHead, StatCard } from "@/components/dashboard/DashboardLayout";
import { ReviewActivityFeed, ReviewCenterBoard } from "@/components/workflows/ReviewCenterBoard";
import { useReviewerReviewCenter } from "@/lib/review-center";

export const Route = createFileRoute("/admin2/review-center")({
  component: Admin2ReviewCenter,
});

function Admin2ReviewCenter() {
  const center = useReviewerReviewCenter("admin2");

  return (
    <>
      <PageHead title="Review center" sub="Centralized validation context for Admin 2 across compliance, publishing, closeout, and cross-workflow review." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending validation" value={`${center.pendingCount}`} delta="Items waiting for secondary administrative review" icon={ClipboardCheck} tone="gold" />
        <StatCard label="Recent notes" value={`${center.feedbackCount}`} delta="Cross-workflow feedback and revision guidance already logged" icon={MessageSquare} tone="primary" />
        <StatCard label="Validation lanes" value="5" delta="Workflows, closeouts, posts, accreditation, and trackers" icon={CheckCircle2} tone="emerald" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ReviewCenterBoard
          title="Admin 2 action queue"
          emptyTitle="No Admin 2 items waiting"
          emptySub="Adviser-approved submissions will surface here for secondary review."
          items={center.pendingActionItems}
        />
        <ReviewActivityFeed title="Recent Admin 2 feedback" empty="Comments and revision notes you leave will appear here." items={center.recentFeedback} />
      </div>
      <div className="mt-6">
        <StatCard label="Compliance posture" value={center.pendingCount === 0 ? "Clear" : "Active"} delta="Use this page to keep validation history visible while moving items toward Admin 1" icon={ShieldAlert} tone={center.pendingCount === 0 ? "emerald" : "rose"} />
      </div>
    </>
  );
}
