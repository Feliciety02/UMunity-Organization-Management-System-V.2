import { useMemo } from "react";
import { usePostApprovals } from "@/lib/post-approvals";
import { useComplianceSubmissions } from "@/lib/org-compliance";
import { useEventDocs } from "@/lib/event-requirements";
import { useWorkflows } from "@/lib/workflows";

type ActivityEntry = {
  actor: string;
  kind: "workflow" | "post" | "compliance" | "requirements" | "closeout";
  action: string;
  detail: string;
  timestamp: number;
};

export type AdviserMemberActivity = {
  name: string;
  detail: string;
  status: string;
  contributions: number;
  lastActiveAt: number;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function matchesOrg(targetOrg: string | undefined, candidate: { orgName?: string; orgSlug?: string; orgShort?: string }) {
  if (!targetOrg) return true;
  const targetSlug = slugify(targetOrg);
  return (
    candidate.orgName === targetOrg ||
    candidate.orgSlug === targetSlug ||
    candidate.orgShort === "UMCSS"
  );
}

function startOfMonth(ts = Date.now()) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function useAdviserInsights(orgName?: string) {
  const workflows = useWorkflows().filter((workflow) =>
    matchesOrg(orgName, { orgName: workflow.orgName, orgShort: workflow.orgShort }),
  );
  const postApprovals = usePostApprovals().filter((approval) =>
    matchesOrg(orgName, { orgName: approval.orgName, orgSlug: approval.orgSlug }),
  );
  const compliance = useComplianceSubmissions().filter((submission) =>
    matchesOrg(orgName, { orgName: submission.orgName, orgSlug: submission.orgSlug }),
  );
  const requirements = useEventDocs().filter((doc) =>
    matchesOrg(orgName, { orgShort: doc.orgShort }),
  );

  return useMemo(() => {
    const pendingReviews =
      workflows.filter((workflow) => workflow.status === "pending_adviser").length +
      workflows.filter(
        (workflow) =>
          (workflow.status === "approved" || workflow.status === "completed") &&
          workflow.operations.postEvent.closeoutStatus === "pending_adviser",
      ).length +
      postApprovals.filter((approval) => approval.status === "pending_adviser").length +
      compliance.filter((submission) => submission.status === "pending_adviser").length +
      requirements.filter((doc) => doc.reviewStatus === "pending_adviser").length;

    const monthStart = startOfMonth();

    const approvedThisMonth =
      workflows.flatMap((workflow) => workflow.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= monthStart && entry.action === "approved").length +
      postApprovals.flatMap((approval) => approval.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= monthStart && entry.action === "approved").length +
      compliance.flatMap((submission) => submission.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= monthStart && entry.action === "approved").length +
      requirements.flatMap((doc) => doc.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= monthStart && entry.action === "approved").length;

    const turnaroundSamples: number[] = [];

    workflows.forEach((workflow) => {
      const submitted = workflow.history.find((entry) => entry.action === "submitted");
      const approved = workflow.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
      if (submitted && approved) turnaroundSamples.push((approved.createdAt - submitted.createdAt) / 86_400_000);
    });
    postApprovals.forEach((approval) => {
      const submitted = approval.history.find((entry) => entry.action === "submitted");
      const approved = approval.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
      if (submitted && approved) turnaroundSamples.push((approved.createdAt - submitted.createdAt) / 86_400_000);
    });
    compliance.forEach((submission) => {
      const submitted = submission.history.find((entry) => entry.action === "submitted");
      const approved = submission.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
      if (submitted && approved) turnaroundSamples.push((approved.createdAt - submitted.createdAt) / 86_400_000);
    });
    requirements.forEach((doc) => {
      const submitted = doc.history.find((entry) => entry.action === "submitted");
      const approved = doc.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
      if (submitted && approved) turnaroundSamples.push((approved.createdAt - submitted.createdAt) / 86_400_000);
    });

    const avgTurnaroundDays = average(turnaroundSamples);

    const memberCount =
      compliance.find((submission) => matchesOrg(orgName, { orgName: submission.orgName, orgSlug: submission.orgSlug }))?.data.memberCount ??
      412;

    const leaderActivities: ActivityEntry[] = [];

    workflows.forEach((workflow) => {
      workflow.history
        .filter((entry) => entry.byRole === "leader")
        .forEach((entry) =>
          leaderActivities.push({
            actor: entry.byName,
            kind: "workflow",
            action: entry.action,
            detail: entry.note ?? `Updated event workflow for ${workflow.proposal.title}.`,
            timestamp: entry.createdAt,
          }),
        );
      workflow.comments
        .filter((entry) => entry.authorRole === "leader")
        .forEach((entry) =>
          leaderActivities.push({
            actor: entry.authorName,
            kind: entry.sectionId === "post-event-closeout" ? "closeout" : "workflow",
            action: "commented",
            detail: entry.message,
            timestamp: entry.createdAt,
          }),
        );
    });

    postApprovals.forEach((approval) => {
      approval.history
        .filter((entry) => entry.byRole === "leader")
        .forEach((entry) =>
          leaderActivities.push({
            actor: entry.byName,
            kind: "post",
            action: entry.action,
            detail: entry.note ?? `Worked on post "${approval.title || approval.type}".`,
            timestamp: entry.createdAt,
          }),
        );
    });

    compliance.forEach((submission) => {
      submission.history
        .filter((entry) => entry.byRole === "leader")
        .forEach((entry) =>
          leaderActivities.push({
            actor: entry.byName,
            kind: "compliance",
            action: entry.action,
            detail: entry.note ?? `Updated accreditation submission for ${submission.orgName}.`,
            timestamp: entry.createdAt,
          }),
        );
    });

    requirements.forEach((doc) => {
      doc.history
        .filter((entry) => entry.byRole === "leader")
        .forEach((entry) =>
          leaderActivities.push({
            actor: entry.byName,
            kind: "requirements",
            action: entry.action,
            detail: entry.note ?? `Updated requirements tracker for ${doc.title}.`,
            timestamp: entry.createdAt,
          }),
        );
    });

    const memberActivityMap = new Map<string, AdviserMemberActivity>();
    leaderActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((activity) => {
        const existing = memberActivityMap.get(activity.actor);
        if (!existing) {
          memberActivityMap.set(activity.actor, {
            name: activity.actor,
            detail: activity.detail,
            status:
              activity.kind === "closeout"
                ? "Closing out"
                : activity.kind === "requirements"
                  ? "Preparing docs"
                  : activity.kind === "post"
                    ? "Publishing"
                    : activity.kind === "compliance"
                      ? "Governance"
                      : "Active",
            contributions: 1,
            lastActiveAt: activity.timestamp,
          });
        } else {
          existing.contributions += 1;
          if (activity.timestamp > existing.lastActiveAt) {
            existing.lastActiveAt = activity.timestamp;
            existing.detail = activity.detail;
          }
        }
      });

    const memberActivity = [...memberActivityMap.values()]
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt || b.contributions - a.contributions)
      .slice(0, 8);

    const weeklyReviews = Array.from({ length: 8 }, (_, index) => {
      const end = Date.now() - (7 - index) * 7 * 86_400_000;
      const start = end - 7 * 86_400_000;
      return (
        workflows.flatMap((workflow) => workflow.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= start && entry.createdAt < end).length +
        postApprovals.flatMap((approval) => approval.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= start && entry.createdAt < end).length +
        compliance.flatMap((submission) => submission.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= start && entry.createdAt < end).length +
        requirements.flatMap((doc) => doc.history).filter((entry) => entry.byRole === "adviser" && entry.createdAt >= start && entry.createdAt < end).length
      );
    });

    const engagementPulse = Math.min(
      99,
      Math.round(
        62 +
          memberActivity.length * 3 +
          Math.min(12, workflows.filter((workflow) => workflow.operations.eventDay.attendanceActual > 0).length * 2) +
          Math.min(8, postApprovals.filter((approval) => approval.status === "published").length * 2),
      ),
    );

    return {
      pendingReviews,
      approvedThisMonth,
      avgTurnaroundDays,
      activeMembers: memberCount,
      engagementPulse,
      weeklyReviews,
      memberActivity,
    };
  }, [compliance, orgName, postApprovals, requirements, workflows]);
}
