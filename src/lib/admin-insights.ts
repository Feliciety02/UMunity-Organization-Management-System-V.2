import { useComplianceSubmissions } from "@/lib/org-compliance";
import { formatPostApprovalStatus, usePostApprovals } from "@/lib/post-approvals";
import { formatReqReviewStatus, useEventDocs } from "@/lib/event-requirements";
import {
  formatWorkflowStatus,
  formatCloseoutStatus,
  useTransitionWorkflows,
  useWorkflows,
} from "@/lib/workflows";

type AdminRole = "admin2" | "admin1";

type QueueTone = "danger" | "warning" | "info";

export type AdminQueueItem = {
  id: string;
  title: string;
  orgName: string;
  lane: string;
  status: string;
  tone: QueueTone;
  href: string;
  ageHours: number;
  note: string;
};

export type AdminOrgWatchItem = {
  orgName: string;
  pendingItems: number;
  revisionItems: number;
  finalAuthorityItems: number;
  activityLabel: string;
};

export type GovernanceCycleItem = {
  title: string;
  status: string;
  note: string;
  href: string;
};

function hoursSince(timestamp: number) {
  return Math.max(1, Math.round((Date.now() - timestamp) / 3_600_000));
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function startOfDay(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return date.getTime();
}

function queueToneForAge(ageHours: number): QueueTone {
  if (ageHours >= 48) return "danger";
  if (ageHours >= 18) return "warning";
  return "info";
}

function activityLabelFor(hours: number) {
  if (hours < 12) return "Updated today";
  if (hours < 36) return "Updated yesterday";
  if (hours < 72) return "Updated this week";
  return "Needs attention";
}

function pushWatch(
  map: Map<string, AdminOrgWatchItem>,
  orgName: string,
  flags: { pending?: boolean; revision?: boolean; finalAuthority?: boolean; ageHours: number },
) {
  const current = map.get(orgName) ?? {
    orgName,
    pendingItems: 0,
    revisionItems: 0,
    finalAuthorityItems: 0,
    activityLabel: activityLabelFor(flags.ageHours),
  };

  if (flags.pending) current.pendingItems += 1;
  if (flags.revision) current.revisionItems += 1;
  if (flags.finalAuthority) current.finalAuthorityItems += 1;
  current.activityLabel =
    current.activityLabel === "Needs attention" || flags.ageHours > 48
      ? "Needs attention"
      : current.activityLabel;

  map.set(orgName, current);
}

export function useAdminInsights(role: AdminRole) {
  const workflows = useWorkflows();
  const transitions = useTransitionWorkflows();
  const postApprovals = usePostApprovals();
  const compliance = useComplianceSubmissions();
  const requirements = useEventDocs();

  const admin2WorkflowQueue = workflows.filter((workflow) => workflow.status === "pending_admin2");
  const admin2CloseoutQueue = workflows.filter(
    (workflow) =>
      (workflow.status === "approved" || workflow.status === "completed") &&
      workflow.operations.postEvent.closeoutStatus === "pending_admin2",
  );
  const admin2PostQueue = postApprovals.filter((approval) => approval.status === "pending_admin2");
  const admin2ComplianceQueue = compliance.filter((submission) => submission.status === "pending_admin2");
  const admin2RequirementsQueue = requirements.filter((doc) => doc.reviewStatus === "pending_admin2");

  const admin1WorkflowQueue = workflows.filter((workflow) => workflow.status === "pending_admin1");
  const admin1ComplianceQueue = compliance.filter((submission) => submission.status === "pending_admin1");
  const admin1TransitionQueue = transitions.filter((workflow) => workflow.status === "pending_admin1");

  const queueItems: AdminQueueItem[] = role === "admin2"
    ? [
        ...admin2WorkflowQueue.map((workflow) => {
          const ageHours = hoursSince(workflow.updatedAt);
          return {
            id: `workflow-${workflow.id}`,
            title: workflow.proposal.title,
            orgName: workflow.orgName,
            lane: "Event workflow",
            status: formatWorkflowStatus(workflow.status),
            tone: queueToneForAge(ageHours),
            href: `/admin2/workflows/${workflow.id}`,
            ageHours,
            note: workflow.currentStage,
          } satisfies AdminQueueItem;
        }),
        ...admin2CloseoutQueue.map((workflow) => {
          const ageHours = hoursSince(workflow.updatedAt);
          return {
            id: `closeout-${workflow.id}`,
            title: workflow.proposal.title,
            orgName: workflow.orgName,
            lane: "Post-event closeout",
            status: formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus),
            tone: queueToneForAge(ageHours),
            href: `/admin2/workflows/${workflow.id}`,
            ageHours,
            note: "Financial wrap-up and outcomes review",
          } satisfies AdminQueueItem;
        }),
        ...admin2PostQueue.map((approval) => {
          const ageHours = hoursSince(approval.updatedAt);
          return {
            id: `post-${approval.id}`,
            title: approval.title || "Untitled post",
            orgName: approval.orgName,
            lane: "Post publishing",
            status: formatPostApprovalStatus(approval.status),
            tone: queueToneForAge(ageHours),
            href: `/admin2/posts/${approval.id}`,
            ageHours,
            note: `${approval.type} - ${approval.visibility}`,
          } satisfies AdminQueueItem;
        }),
        ...admin2ComplianceQueue.map((submission) => {
          const ageHours = hoursSince(submission.updatedAt);
          return {
            id: `compliance-${submission.id}`,
            title: submission.orgName,
            orgName: submission.orgName,
            lane: "Accreditation",
            status: submission.status.replaceAll("_", " "),
            tone: queueToneForAge(ageHours),
            href: `/admin2/compliance/${submission.id}`,
            ageHours,
            note: submission.data.accreditationScope,
          } satisfies AdminQueueItem;
        }),
        ...admin2RequirementsQueue.map((doc) => {
          const latest = doc.history[0]?.createdAt ?? doc.createdAt;
          const ageHours = hoursSince(latest);
          return {
            id: `requirements-${doc.id}`,
            title: doc.title,
            orgName: doc.orgShort,
            lane: "Requirements tracker",
            status: formatReqReviewStatus(doc.reviewStatus),
            tone: queueToneForAge(ageHours),
            href: `/admin2/requirements/${doc.id}`,
            ageHours,
            note: doc.category,
          } satisfies AdminQueueItem;
        }),
      ]
    : [
        ...admin1WorkflowQueue.map((workflow) => {
          const ageHours = hoursSince(workflow.updatedAt);
          return {
            id: `workflow-${workflow.id}`,
            title: workflow.proposal.title,
            orgName: workflow.orgName,
            lane: "Final event approval",
            status: formatWorkflowStatus(workflow.status),
            tone: queueToneForAge(ageHours),
            href: `/admin1/workflows/${workflow.id}`,
            ageHours,
            note: workflow.currentStage,
          } satisfies AdminQueueItem;
        }),
        ...admin1ComplianceQueue.map((submission) => {
          const ageHours = hoursSince(submission.updatedAt);
          return {
            id: `compliance-${submission.id}`,
            title: submission.orgName,
            orgName: submission.orgName,
            lane: "Accreditation authority",
            status: submission.status.replaceAll("_", " "),
            tone: queueToneForAge(ageHours),
            href: `/admin1/accreditation/${submission.id}`,
            ageHours,
            note: submission.data.accreditationScope,
          } satisfies AdminQueueItem;
        }),
        ...admin1TransitionQueue.map((transition) => {
          const ageHours = hoursSince(transition.updatedAt);
          return {
            id: `transition-${transition.id}`,
            title: transition.orgName,
            orgName: transition.orgName,
            lane: "Officer transition",
            status: transition.status.replaceAll("_", " "),
            tone: queueToneForAge(ageHours),
            href: `/admin1/transitions/${transition.id}`,
            ageHours,
            note: `${transition.nominees.length} nominees`,
          } satisfies AdminQueueItem;
        }),
      ];

  queueItems.sort((a, b) => b.ageHours - a.ageHours);

  const watchMap = new Map<string, AdminOrgWatchItem>();

  workflows.forEach((workflow) => {
    pushWatch(watchMap, workflow.orgName, {
      pending: workflow.status !== "draft" && workflow.status !== "approved" && workflow.status !== "completed",
      revision: workflow.status === "revision_requested",
      finalAuthority: workflow.status === "pending_admin1",
      ageHours: hoursSince(workflow.updatedAt),
    });
    if (workflow.operations.postEvent.closeoutStatus === "pending_admin2" || workflow.operations.postEvent.closeoutStatus === "revision_requested") {
      pushWatch(watchMap, workflow.orgName, {
        pending: workflow.operations.postEvent.closeoutStatus === "pending_admin2",
        revision: workflow.operations.postEvent.closeoutStatus === "revision_requested",
        ageHours: hoursSince(workflow.updatedAt),
      });
    }
  });

  compliance.forEach((submission) => {
    pushWatch(watchMap, submission.orgName, {
      pending: submission.status === "pending_admin2" || submission.status === "pending_admin1",
      revision: submission.status === "revision_requested",
      finalAuthority: submission.status === "pending_admin1",
      ageHours: hoursSince(submission.updatedAt),
    });
  });

  postApprovals.forEach((approval) => {
    pushWatch(watchMap, approval.orgName, {
      pending: approval.status === "pending_admin2",
      revision: approval.status === "revision_requested",
      ageHours: hoursSince(approval.updatedAt),
    });
  });

  transitions.forEach((transition) => {
    pushWatch(watchMap, transition.orgName, {
      pending: transition.status === "pending_adviser" || transition.status === "pending_admin1",
      revision: transition.status === "revision_requested",
      finalAuthority: transition.status === "pending_admin1",
      ageHours: hoursSince(transition.updatedAt),
    });
  });

  requirements.forEach((doc) => {
    const latest = doc.history[0]?.createdAt ?? doc.createdAt;
    pushWatch(watchMap, doc.orgShort, {
      pending: doc.reviewStatus === "pending_admin2",
      revision: doc.reviewStatus === "revision_requested",
      ageHours: hoursSince(latest),
    });
  });

  const orgWatchlist = [...watchMap.values()]
    .sort((a, b) => {
      const scoreA = a.finalAuthorityItems * 3 + a.pendingItems * 2 + a.revisionItems;
      const scoreB = b.finalAuthorityItems * 3 + b.pendingItems * 2 + b.revisionItems;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  const monthStart = startOfMonth();
  const monthlyDecisions = role === "admin2"
    ? [
        ...workflows.flatMap((workflow) => workflow.history.filter((entry) => entry.byRole === "admin2" && entry.createdAt >= monthStart && entry.action === "approved")),
        ...postApprovals.flatMap((approval) => approval.history.filter((entry) => entry.byRole === "admin2" && entry.createdAt >= monthStart && (entry.action === "approved" || entry.action === "published"))),
        ...compliance.flatMap((submission) => submission.history.filter((entry) => entry.byRole === "admin2" && entry.createdAt >= monthStart && entry.action === "approved")),
      ].length
    : [
        ...workflows.flatMap((workflow) => workflow.history.filter((entry) => entry.byRole === "admin1" && entry.createdAt >= monthStart && entry.action === "approved")),
        ...compliance.flatMap((submission) => submission.history.filter((entry) => entry.byRole === "admin1" && entry.createdAt >= monthStart && entry.action === "approved")),
        ...transitions.flatMap((workflow) => workflow.history.filter((entry) => entry.byRole === "admin1" && entry.createdAt >= monthStart && entry.action === "completed")),
      ].length;

  const turnaroundSamples = role === "admin2"
    ? [
        ...workflows
          .map((workflow) => {
            const adviserApproval = workflow.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
            const admin2Approval = workflow.history.find((entry) => entry.byRole === "admin2" && entry.action === "approved");
            return adviserApproval && admin2Approval ? (admin2Approval.createdAt - adviserApproval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
        ...postApprovals
          .map((approval) => {
            const adviserApproval = approval.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
            const admin2Decision = approval.history.find((entry) => entry.byRole === "admin2" && (entry.action === "approved" || entry.action === "published"));
            return adviserApproval && admin2Decision ? (admin2Decision.createdAt - adviserApproval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
        ...compliance
          .map((submission) => {
            const adviserApproval = submission.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
            const admin2Approval = submission.history.find((entry) => entry.byRole === "admin2" && entry.action === "approved");
            return adviserApproval && admin2Approval ? (admin2Approval.createdAt - adviserApproval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
      ]
    : [
        ...workflows
          .map((workflow) => {
            const admin2Approval = workflow.history.find((entry) => entry.byRole === "admin2" && entry.action === "approved");
            const admin1Approval = workflow.history.find((entry) => entry.byRole === "admin1" && entry.action === "approved");
            return admin2Approval && admin1Approval ? (admin1Approval.createdAt - admin2Approval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
        ...compliance
          .map((submission) => {
            const admin2Approval = submission.history.find((entry) => entry.byRole === "admin2" && entry.action === "approved");
            const admin1Approval = submission.history.find((entry) => entry.byRole === "admin1" && entry.action === "approved");
            return admin2Approval && admin1Approval ? (admin1Approval.createdAt - admin2Approval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
        ...transitions
          .map((workflow) => {
            const adviserApproval = workflow.history.find((entry) => entry.byRole === "adviser" && entry.action === "approved");
            const admin1Decision = workflow.history.find((entry) => entry.byRole === "admin1" && entry.action === "completed");
            return adviserApproval && admin1Decision ? (admin1Decision.createdAt - adviserApproval.createdAt) / 86_400_000 : null;
          })
          .filter((value): value is number => value !== null),
      ];

  const weeklyDecisions = Array.from({ length: 7 }, (_, index) => {
    const start = startOfDay(6 - index);
    const end = startOfDay(5 - index);
    if (role === "admin2") {
      return (
        workflows.flatMap((workflow) => workflow.history).filter((entry) => entry.byRole === "admin2" && entry.createdAt >= start && entry.createdAt < end).length +
        postApprovals.flatMap((approval) => approval.history).filter((entry) => entry.byRole === "admin2" && entry.createdAt >= start && entry.createdAt < end).length +
        compliance.flatMap((submission) => submission.history).filter((entry) => entry.byRole === "admin2" && entry.createdAt >= start && entry.createdAt < end).length
      );
    }
    return (
      workflows.flatMap((workflow) => workflow.history).filter((entry) => entry.byRole === "admin1" && entry.createdAt >= start && entry.createdAt < end).length +
      compliance.flatMap((submission) => submission.history).filter((entry) => entry.byRole === "admin1" && entry.createdAt >= start && entry.createdAt < end).length +
      transitions.flatMap((workflow) => workflow.history).filter((entry) => entry.byRole === "admin1" && entry.createdAt >= start && entry.createdAt < end).length
    );
  });

  const governanceCycles: GovernanceCycleItem[] = [
    ...transitions
      .filter((workflow) => workflow.status === "pending_admin1" || workflow.status === "completed")
      .slice(0, 3)
      .map((workflow) => ({
        title: `${workflow.orgName} officer transition`,
        status: workflow.status === "completed" ? "Archived" : "Pending Admin 1",
        note: `${workflow.academicYear} - ${workflow.nominees.length} nominees`,
        href: `/admin1/transitions/${workflow.id}`,
      })),
    ...compliance
      .filter((submission) => submission.status === "pending_admin1" || submission.status === "approved")
      .slice(0, 3)
      .map((submission) => ({
        title: `${submission.orgName} accreditation`,
        status: submission.status === "approved" ? "Accredited" : "Pending Admin 1",
        note: `${submission.academicYear} - ${submission.data.accreditationScope}`,
        href: `/admin1/accreditation/${submission.id}`,
      })),
  ].slice(0, 6);

  return {
    queueCount: queueItems.length,
    escalatedCount:
      workflows.filter((workflow) => workflow.status === "pending_admin1").length +
      compliance.filter((submission) => submission.status === "pending_admin1").length +
      transitions.filter((workflow) => workflow.status === "pending_admin1").length,
    monthlyDecisions,
    avgTurnaroundDays: avg(turnaroundSamples),
    revisionLoad:
      workflows.filter((workflow) => workflow.status === "revision_requested").length +
      postApprovals.filter((approval) => approval.status === "revision_requested").length +
      compliance.filter((submission) => submission.status === "revision_requested").length +
      requirements.filter((doc) => doc.reviewStatus === "revision_requested").length +
      transitions.filter((workflow) => workflow.status === "revision_requested").length,
    accreditedOrgs: compliance.filter((submission) => submission.status === "approved").length,
    archivedTransitions: transitions.filter((workflow) => workflow.status === "completed").length,
    weeklyDecisions,
    queueItems,
    orgWatchlist,
    governanceCycles,
  };
}
