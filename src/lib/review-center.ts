import { useComplianceSubmissions } from "@/lib/org-compliance";
import { usePostApprovals } from "@/lib/post-approvals";
import { formatReqReviewStatus, useEventDocs } from "@/lib/event-requirements";
import {
  formatCloseoutStatus,
  formatWorkflowStatus,
  useTransitionWorkflows,
  useWorkflows,
} from "@/lib/workflows";

export type ReviewCenterItem = {
  id: string;
  title: string;
  lane: string;
  orgName: string;
  status: string;
  href: string;
  note: string;
  updatedAt: number;
  tone: "info" | "warning" | "danger" | "success" | "neutral";
};

export type ReviewCenterActivity = {
  id: string;
  title: string;
  lane: string;
  by: string;
  note: string;
  createdAt: number;
  href: string;
};

function reviewerName(role: "adviser" | "admin2") {
  return role === "adviser" ? "Adviser" : "Admin 2";
}

function toneForStatus(status: string): ReviewCenterItem["tone"] {
  if (status.toLowerCase().includes("revision")) return "danger";
  if (status.toLowerCase().includes("pending")) return "warning";
  if (status.toLowerCase().includes("approved") || status.toLowerCase().includes("published")) return "success";
  return "info";
}

function orgShortFrom(name?: string) {
  if (!name) return "UMORG";
  const letters = name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return letters.length >= 2 ? letters.slice(0, 6) : "UMORG";
}

export function useLeaderReviewCenter(orgName?: string) {
  const workflows = useWorkflows().filter((workflow) => !orgName || workflow.orgName === orgName);
  const transitions = useTransitionWorkflows().filter((workflow) => !orgName || workflow.orgName === orgName);
  const postApprovals = usePostApprovals().filter((approval) => !orgName || approval.orgName === orgName);
  const compliance = useComplianceSubmissions().filter((submission) => !orgName || submission.orgName === orgName);
  const orgShort = orgShortFrom(orgName);
  const requirements = useEventDocs().filter((doc) => doc.orgShort === orgShort);

  const actionItems: ReviewCenterItem[] = [
    ...workflows
      .filter((workflow) => workflow.status === "revision_requested")
      .map((workflow) => ({
        id: `workflow-${workflow.id}`,
        title: workflow.proposal.title,
        lane: "Event workflow",
        orgName: workflow.orgName,
        status: formatWorkflowStatus(workflow.status),
        href: `/leader/workflows/${workflow.id}`,
        note: workflow.comments[0]?.message ?? "A reviewer requested updates on this proposal.",
        updatedAt: workflow.updatedAt,
        tone: "danger" as const,
      })),
    ...workflows
      .filter((workflow) => workflow.operations.postEvent.closeoutStatus === "revision_requested")
      .map((workflow) => ({
        id: `closeout-${workflow.id}`,
        title: workflow.proposal.title,
        lane: "Post-event closeout",
        orgName: workflow.orgName,
        status: formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus),
        href: `/leader/workflows/${workflow.id}`,
        note: workflow.comments[0]?.message ?? "Closeout updates are required before final approval.",
        updatedAt: workflow.updatedAt,
        tone: "danger" as const,
      })),
    ...postApprovals
      .filter((approval) => approval.status === "revision_requested")
      .map((approval) => ({
        id: `post-${approval.id}`,
        title: approval.title || "Untitled post",
        lane: "Post approval",
        orgName: approval.orgName,
        status: approval.status.replaceAll("_", " "),
        href: `/leader/post-approvals/${approval.id}`,
        note: approval.comments[0]?.message ?? "Update this draft before it can move forward.",
        updatedAt: approval.updatedAt,
        tone: "danger" as const,
      })),
    ...compliance
      .filter((submission) => submission.status === "revision_requested")
      .map((submission) => ({
        id: `compliance-${submission.id}`,
        title: submission.orgName,
        lane: "Accreditation",
        orgName: submission.orgName,
        status: submission.status.replaceAll("_", " "),
        href: `/leader/compliance/${submission.id}`,
        note: submission.comments[0]?.message ?? "The accreditation workspace needs revisions.",
        updatedAt: submission.updatedAt,
        tone: "danger" as const,
      })),
    ...transitions
      .filter((workflow) => workflow.status === "revision_requested")
      .map((workflow) => ({
        id: `transition-${workflow.id}`,
        title: workflow.orgName,
        lane: "Officer transition",
        orgName: workflow.orgName,
        status: workflow.status.replaceAll("_", " "),
        href: `/leader/officer-transition/${workflow.id}`,
        note: workflow.comments[0]?.message ?? "Adjust the nominee slate based on reviewer guidance.",
        updatedAt: workflow.updatedAt,
        tone: "danger" as const,
      })),
    ...requirements
      .filter((doc) => doc.reviewStatus === "revision_requested")
      .map((doc) => ({
        id: `requirements-${doc.id}`,
        title: doc.title,
        lane: "Requirements tracker",
        orgName: doc.orgShort,
        status: formatReqReviewStatus(doc.reviewStatus),
        href: `/leader/requirements/${doc.id}`,
        note: doc.comments[0]?.message ?? "The requirements tracker needs updates before it can proceed.",
        updatedAt: doc.history[0]?.createdAt ?? doc.createdAt,
        tone: "danger" as const,
      })),
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  const recentActivity: ReviewCenterActivity[] = [
    ...workflows
      .filter((workflow) => workflow.comments[0])
      .map((workflow) => ({
        id: `workflow-activity-${workflow.id}`,
        title: workflow.proposal.title,
        lane: "Event workflow",
        by: workflow.comments[0]?.authorName ?? reviewerName("adviser"),
        note: workflow.comments[0]?.message ?? "Reviewer left a note on this workflow.",
        createdAt: workflow.comments[0]?.createdAt ?? workflow.updatedAt,
        href: `/leader/workflows/${workflow.id}`,
      })),
    ...postApprovals
      .filter((approval) => approval.comments[0])
      .map((approval) => ({
        id: `post-activity-${approval.id}`,
        title: approval.title || "Untitled post",
        lane: "Post approval",
        by: approval.comments[0]?.authorName ?? reviewerName("adviser"),
        note: approval.comments[0]?.message ?? "Reviewer left a note on this post.",
        createdAt: approval.comments[0]?.createdAt ?? approval.updatedAt,
        href: `/leader/post-approvals/${approval.id}`,
      })),
    ...compliance
      .filter((submission) => submission.comments[0])
      .map((submission) => ({
        id: `compliance-activity-${submission.id}`,
        title: submission.orgName,
        lane: "Accreditation",
        by: submission.comments[0]?.authorName ?? reviewerName("adviser"),
        note: submission.comments[0]?.message ?? "Reviewer left a note on this accreditation record.",
        createdAt: submission.comments[0]?.createdAt ?? submission.updatedAt,
        href: `/leader/compliance/${submission.id}`,
      })),
    ...transitions
      .filter((workflow) => workflow.comments[0])
      .map((workflow) => ({
        id: `transition-activity-${workflow.id}`,
        title: workflow.orgName,
        lane: "Officer transition",
        by: workflow.comments[0]?.authorName ?? reviewerName("adviser"),
        note: workflow.comments[0]?.message ?? "Reviewer left a note on this transition.",
        createdAt: workflow.comments[0]?.createdAt ?? workflow.updatedAt,
        href: `/leader/officer-transition/${workflow.id}`,
      })),
    ...requirements
      .filter((doc) => doc.comments[0])
      .map((doc) => ({
        id: `requirements-activity-${doc.id}`,
        title: doc.title,
        lane: "Requirements tracker",
        by: doc.comments[0]?.authorName ?? reviewerName("adviser"),
        note: doc.comments[0]?.message ?? "Reviewer left a note on this tracker.",
        createdAt: doc.comments[0]?.createdAt ?? doc.createdAt,
        href: `/leader/requirements/${doc.id}`,
      })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return {
    actionItems,
    recentActivity,
    revisionCount: actionItems.length,
    recentCommentCount: recentActivity.length,
  };
}

export function useReviewerReviewCenter(role: "adviser" | "admin2") {
  const workflows = useWorkflows();
  const transitions = useTransitionWorkflows();
  const postApprovals = usePostApprovals();
  const compliance = useComplianceSubmissions();
  const requirements = useEventDocs();

  const pendingActionItems: ReviewCenterItem[] = [
    ...workflows
      .filter((workflow) => (role === "adviser" ? workflow.status === "pending_adviser" : workflow.status === "pending_admin2"))
      .map((workflow) => ({
        id: `workflow-${workflow.id}`,
        title: workflow.proposal.title,
        lane: "Event workflow",
        orgName: workflow.orgName,
        status: formatWorkflowStatus(workflow.status),
        href: `/${role}/workflows/${workflow.id}`,
        note: workflow.currentStage,
        updatedAt: workflow.updatedAt,
        tone: toneForStatus(formatWorkflowStatus(workflow.status)),
      })),
    ...workflows
      .filter((workflow) =>
        role === "adviser"
          ? workflow.operations.postEvent.closeoutStatus === "pending_adviser"
          : workflow.operations.postEvent.closeoutStatus === "pending_admin2",
      )
      .map((workflow) => ({
        id: `closeout-${workflow.id}`,
        title: workflow.proposal.title,
        lane: "Post-event closeout",
        orgName: workflow.orgName,
        status: formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus),
        href: `/${role}/workflows/${workflow.id}`,
        note: "Financial wrap-up and narrative closeout",
        updatedAt: workflow.updatedAt,
        tone: toneForStatus(formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus)),
      })),
    ...postApprovals
      .filter((approval) => (role === "adviser" ? approval.status === "pending_adviser" : approval.status === "pending_admin2"))
      .map((approval) => ({
        id: `post-${approval.id}`,
        title: approval.title || "Untitled post",
        lane: "Post approval",
        orgName: approval.orgName,
        status: approval.status.replaceAll("_", " "),
        href: `/${role}/posts/${approval.id}`,
        note: `${approval.type} - ${approval.visibility}`,
        updatedAt: approval.updatedAt,
        tone: toneForStatus(approval.status),
      })),
    ...compliance
      .filter((submission) => (role === "adviser" ? submission.status === "pending_adviser" : submission.status === "pending_admin2"))
      .map((submission) => ({
        id: `compliance-${submission.id}`,
        title: submission.orgName,
        lane: "Accreditation",
        orgName: submission.orgName,
        status: submission.status.replaceAll("_", " "),
        href: `/${role}/compliance/${submission.id}`,
        note: submission.data.accreditationScope,
        updatedAt: submission.updatedAt,
        tone: toneForStatus(submission.status),
      })),
    ...transitions
      .filter((workflow) => role === "adviser" && workflow.status === "pending_adviser")
      .map((workflow) => ({
        id: `transition-${workflow.id}`,
        title: workflow.orgName,
        lane: "Officer transition",
        orgName: workflow.orgName,
        status: workflow.status.replaceAll("_", " "),
        href: `/${role}/transitions/${workflow.id}`,
        note: `${workflow.nominees.length} nominees`,
        updatedAt: workflow.updatedAt,
        tone: toneForStatus(workflow.status),
      })),
    ...requirements
      .filter((doc) => (role === "adviser" ? doc.reviewStatus === "pending_adviser" : doc.reviewStatus === "pending_admin2"))
      .map((doc) => ({
        id: `requirements-${doc.id}`,
        title: doc.title,
        lane: "Requirements tracker",
        orgName: doc.orgShort,
        status: formatReqReviewStatus(doc.reviewStatus),
        href: `/${role}/requirements/${doc.id}`,
        note: doc.category,
        updatedAt: doc.history[0]?.createdAt ?? doc.createdAt,
        tone: toneForStatus(formatReqReviewStatus(doc.reviewStatus)),
      })),
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  const recentFeedback: ReviewCenterActivity[] = [
    ...workflows
      .flatMap((workflow) =>
        workflow.comments
          .filter((comment) => comment.authorRole === role)
          .map((comment) => ({
            id: `workflow-comment-${comment.id}`,
            title: workflow.proposal.title,
            lane: "Event workflow",
            by: comment.authorName,
            note: comment.message,
            createdAt: comment.createdAt,
            href: `/${role}/workflows/${workflow.id}`,
          })),
      ),
    ...postApprovals
      .flatMap((approval) =>
        approval.comments
          .filter((comment) => comment.authorRole === role)
          .map((comment) => ({
            id: `post-comment-${comment.id}`,
            title: approval.title || "Untitled post",
            lane: "Post approval",
            by: comment.authorName,
            note: comment.message,
            createdAt: comment.createdAt,
            href: `/${role}/posts/${approval.id}`,
          })),
      ),
    ...compliance
      .flatMap((submission) =>
        submission.comments
          .filter((comment) => comment.authorRole === role)
          .map((comment) => ({
            id: `compliance-comment-${comment.id}`,
            title: submission.orgName,
            lane: "Accreditation",
            by: comment.authorName,
            note: comment.message,
            createdAt: comment.createdAt,
            href: `/${role}/compliance/${submission.id}`,
          })),
      ),
    ...transitions
      .flatMap((workflow) =>
        workflow.comments
          .filter((comment) => comment.authorRole === role)
          .map((comment) => ({
            id: `transition-comment-${comment.id}`,
            title: workflow.orgName,
            lane: "Officer transition",
            by: comment.authorName,
            note: comment.message,
            createdAt: comment.createdAt,
            href: `/${role}/transitions/${workflow.id}`,
          })),
      ),
    ...requirements
      .flatMap((doc) =>
        doc.comments
          .filter((comment) => comment.authorRole === role)
          .map((comment) => ({
            id: `requirements-comment-${comment.id}`,
            title: doc.title,
            lane: "Requirements tracker",
            by: comment.authorName,
            note: comment.message,
            createdAt: comment.createdAt,
            href: `/${role}/requirements/${doc.id}`,
          })),
      ),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12);

  return {
    pendingActionItems,
    recentFeedback,
    pendingCount: pendingActionItems.length,
    feedbackCount: recentFeedback.length,
  };
}
