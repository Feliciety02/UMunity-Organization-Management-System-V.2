import { useEffect, useState, useSyncExternalStore } from "react";
import { addNotification } from "@/lib/notifications";
import type { WorkflowActor } from "@/lib/workflows";
import { applyAccreditationDecision, sendOrgRegistryNotification } from "@/lib/org-registry";

export type ComplianceStatus =
  | "draft"
  | "pending_adviser"
  | "revision_requested"
  | "pending_admin2"
  | "pending_admin1"
  | "approved";

export type ComplianceAttachment = {
  id: string;
  label: string;
};

export type ComplianceFormData = {
  category: string;
  adviserName: string;
  memberCount: number;
  accreditationScope: string;
  mission: string;
  vision: string;
  annualGoals: string;
  flagshipPrograms: string[];
  memberDevelopment: string;
  riskControls: string;
  budgetSummary: string;
  fundingModel: string;
  accountabilityPlan: string;
  officerRosterSummary: string;
  transitionReadiness: string;
  adviserNotes: string;
  attachments: ComplianceAttachment[];
};

export type ComplianceComment = {
  id: string;
  authorRole: WorkflowActor["role"];
  authorName: string;
  message: string;
  createdAt: number;
};

export type ComplianceHistoryEntry = {
  id: string;
  action: "created" | "submitted" | "commented" | "revision_requested" | "approved";
  byRole: WorkflowActor["role"];
  byName: string;
  note?: string;
  createdAt: number;
};

export type OrgComplianceSubmission = {
  id: string;
  orgName: string;
  orgSlug: string;
  academicYear: string;
  createdBy: string;
  status: ComplianceStatus;
  createdAt: number;
  updatedAt: number;
  data: ComplianceFormData;
  comments: ComplianceComment[];
  history: ComplianceHistoryEntry[];
};

const KEY = "umunity.org-compliance.v1";
const EVENT = "umunity:org-compliance";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function currentAy() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function defaultFormData(): ComplianceFormData {
  return {
    category: "Academic",
    adviserName: "Prof. Elena Tan",
    memberCount: 412,
    accreditationScope: "Recognition renewal",
    mission: "Build student leaders in computing through guided projects, service, and campus collaboration.",
    vision: "Be the university's most trusted student technology community for innovation, ethics, and peer growth.",
    annualGoals: "Deliver four flagship programs, improve retention, and strengthen cross-college partnerships.",
    flagshipPrograms: ["Innovation Summit", "Hack Night", "Peer Tutoring Sprint"],
    memberDevelopment: "Monthly skill labs, mentorship circles, and officer shadowing tracks for new volunteers.",
    riskControls: "Venue approvals, attendance cap planning, marshal assignments, and adviser-facing escalation rules.",
    budgetSummary: "Blend of member dues, sponsorship support, and project-based allocations with tracked spending checkpoints.",
    fundingModel: "Treasurer-led budgeting with pre-event estimates and post-event reconciliation per activity.",
    accountabilityPlan: "Quarterly reporting, workflow comments, and officer transition archival every academic year.",
    officerRosterSummary: "President, Vice President, Secretary, Treasurer, PRO, and committee leads mapped to clear owners.",
    transitionReadiness: "All major roles have shadow officers and handover notes prepared before the next cycle.",
    adviserNotes: "Org is active and capable of handling another recognition cycle with structured oversight.",
    attachments: [
      { id: "seed-attach-1", label: "constitution-summary.pdf" },
      { id: "seed-attach-2", label: "annual-plan-outline.pdf" },
    ],
  };
}

const seed: OrgComplianceSubmission[] = [
  {
    id: "compliance-umcss-2026",
    orgName: "UM Computer Studies Society",
    orgSlug: "cs-society",
    academicYear: currentAy(),
    createdBy: "Marco Reyes",
    status: "pending_adviser",
    createdAt: Date.now() - 7 * 60 * 60 * 1000,
    updatedAt: Date.now() - 6 * 60 * 60 * 1000,
    data: defaultFormData(),
    comments: [],
    history: [
      {
        id: "compliance-history-1",
        action: "created",
        byRole: "leader",
        byName: "Marco Reyes",
        note: "Prepared organization compliance renewal workspace.",
        createdAt: Date.now() - 7 * 60 * 60 * 1000,
      },
      {
        id: "compliance-history-2",
        action: "submitted",
        byRole: "leader",
        byName: "Marco Reyes",
        note: "Sent to adviser for first-line accreditation review.",
        createdAt: Date.now() - 6 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: "compliance-eco-2026",
    orgName: "Eco Warriors Guild",
    orgSlug: "eco-warriors",
    academicYear: currentAy(),
    createdBy: "Liza Mendoza",
    status: "pending_admin1",
    createdAt: Date.now() - 40 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    data: {
      ...defaultFormData(),
      category: "Environmental",
      adviserName: "Prof. Mila Ramos",
      memberCount: 186,
      accreditationScope: "Full accreditation review",
      flagshipPrograms: ["River Watch", "Campus Zero-Waste Week"],
      adviserNotes: "Adviser verification complete. Org has met activity and reporting standards.",
    },
    comments: [
      {
        id: "compliance-comment-1",
        authorRole: "admin2",
        authorName: "Dr. Celeste Dizon",
        message: "Compliance checkpoints are complete. Escalating for final Admin 1 authority.",
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
      },
    ],
    history: [
      {
        id: "compliance-history-3",
        action: "created",
        byRole: "leader",
        byName: "Liza Mendoza",
        createdAt: Date.now() - 40 * 60 * 60 * 1000,
      },
      {
        id: "compliance-history-4",
        action: "submitted",
        byRole: "leader",
        byName: "Liza Mendoza",
        createdAt: Date.now() - 39 * 60 * 60 * 1000,
      },
      {
        id: "compliance-history-5",
        action: "approved",
        byRole: "adviser",
        byName: "Prof. Mila Ramos",
        note: "Forwarded to Admin 2.",
        createdAt: Date.now() - 18 * 60 * 60 * 1000,
      },
      {
        id: "compliance-history-6",
        action: "approved",
        byRole: "admin2",
        byName: "Dr. Celeste Dizon",
        note: "Ready for Admin 1 final authority.",
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
      },
    ],
  },
];

function read() {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as OrgComplianceSubmission[];
  } catch {
    return seed;
  }
}

function write(list: OrgComplianceSubmission[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function notifyQueue(status: ComplianceStatus, submission: OrgComplianceSubmission) {
  if (status === "pending_adviser") {
    addNotification({
      title: `${submission.orgName} accreditation is pending adviser review`,
      meta: submission.academicYear,
      category: "system",
      href: `/adviser/compliance/${submission.id}`,
    });
  }
  if (status === "pending_admin2") {
    addNotification({
      title: `${submission.orgName} accreditation cleared adviser review`,
      meta: "Pending Admin 2",
      category: "system",
      href: `/admin2/compliance/${submission.id}`,
    });
  }
  if (status === "pending_admin1") {
    addNotification({
      title: `${submission.orgName} accreditation is ready for final authority`,
      meta: "Pending Admin 1",
      category: "system",
      href: `/admin1/accreditation/${submission.id}`,
    });
  }
}

export function formatComplianceStatus(status: ComplianceStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_adviser":
      return "Pending Adviser";
    case "revision_requested":
      return "Revision Requested";
    case "pending_admin2":
      return "Pending Admin 2";
    case "pending_admin1":
      return "Pending Admin 1";
    case "approved":
      return "Accredited";
  }
}

export function complianceTone(status: ComplianceStatus): "neutral" | "info" | "warning" | "danger" | "success" {
  switch (status) {
    case "draft":
      return "neutral";
    case "pending_adviser":
      return "info";
    case "revision_requested":
      return "danger";
    case "pending_admin2":
    case "pending_admin1":
      return "warning";
    case "approved":
      return "success";
  }
}

export function getComplianceSubmissions() {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getComplianceSubmission(id: string) {
  return read().find((item) => item.id === id) ?? null;
}

export function createComplianceSubmission(input: {
  orgName: string;
  orgSlug: string;
  createdBy: string;
  academicYear: string;
  data: ComplianceFormData;
  submit?: boolean;
}) {
  const submission: OrgComplianceSubmission = {
    id: nowId("compliance"),
    orgName: input.orgName,
    orgSlug: input.orgSlug,
    createdBy: input.createdBy,
    academicYear: input.academicYear,
    status: input.submit ? "pending_adviser" : "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: input.data,
    comments: [],
    history: [
      {
        id: nowId("history"),
        action: "created",
        byRole: "leader",
        byName: input.createdBy,
        note: input.submit ? "Created and sent for adviser review." : "Saved as a draft workspace.",
        createdAt: Date.now(),
      },
      ...(input.submit
        ? [
            {
              id: nowId("history"),
              action: "submitted" as const,
              byRole: "leader" as const,
              byName: input.createdBy,
              note: "Submitted to adviser review.",
              createdAt: Date.now(),
            },
          ]
        : []),
    ],
  };
  write([submission, ...read()]);
  if (input.submit) notifyQueue("pending_adviser", submission);
  return submission;
}

function updateSubmission(id: string, updater: (submission: OrgComplianceSubmission) => OrgComplianceSubmission) {
  const next = read().map((submission) => (submission.id === id ? updater({ ...submission }) : submission));
  write(next);
  return next.find((submission) => submission.id === id) ?? null;
}

export function addComplianceComment(id: string, actor: WorkflowActor, message: string) {
  return updateSubmission(id, (submission) => ({
    ...submission,
    updatedAt: Date.now(),
    comments: [
      {
        id: nowId("comment"),
        authorRole: actor.role,
        authorName: actor.name,
        message,
        createdAt: Date.now(),
      },
      ...submission.comments,
    ],
    history: [
      {
        id: nowId("history"),
        action: "commented",
        byRole: actor.role,
        byName: actor.name,
        note: message,
        createdAt: Date.now(),
      },
      ...submission.history,
    ],
  }));
}

export function requestComplianceRevision(id: string, actor: WorkflowActor, note: string) {
  return updateSubmission(id, (submission) => {
    addNotification({
      title: `${submission.orgName} accreditation needs revisions`,
      meta: actor.name,
      category: "system",
      href: `/leader/compliance/${submission.id}`,
    });
    return {
      ...submission,
      status: "revision_requested",
      updatedAt: Date.now(),
      comments: [
        {
          id: nowId("comment"),
          authorRole: actor.role,
          authorName: actor.name,
          message: note,
          createdAt: Date.now(),
        },
        ...submission.comments,
      ],
      history: [
        {
          id: nowId("history"),
          action: "revision_requested",
          byRole: actor.role,
          byName: actor.name,
          note,
          createdAt: Date.now(),
        },
        ...submission.history,
      ],
    };
  });
}

export function approveCompliance(id: string, actor: WorkflowActor, note?: string) {
  return updateSubmission(id, (submission) => {
    let status = submission.status;
    if (actor.role === "adviser") status = "pending_admin2";
    if (actor.role === "admin2") status = "pending_admin1";
    if (actor.role === "admin1") status = "approved";

    const next = {
      ...submission,
      status,
      updatedAt: Date.now(),
      history: [
        {
          id: nowId("history"),
          action: "approved" as const,
          byRole: actor.role,
          byName: actor.name,
          note:
            note ??
            (actor.role === "adviser"
              ? "Forwarded to Admin 2."
              : actor.role === "admin2"
                ? "Escalated to Admin 1."
                : "Accreditation approved."),
          createdAt: Date.now(),
        },
        ...submission.history,
      ],
    };

    if (status !== "approved") {
      notifyQueue(status, next);
    } else {
      applyAccreditationDecision(submission.orgSlug, {
        by: actor.name,
        academicYear: submission.academicYear,
        status: "active",
        lifecycleStatus: "recognized",
        note: note ?? "Admin 1 approved this accreditation cycle and kept the organization recognized.",
      });
      sendOrgRegistryNotification(
        submission.orgSlug,
        `${next.orgName} remains recognized after final accreditation approval`,
        next.academicYear,
      );
      addNotification({
        title: `${next.orgName} accreditation has been approved`,
        meta: next.academicYear,
        category: "system",
        href: `/leader/compliance/${next.id}`,
      });
    }

    return next;
  });
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const listener = () => callback();
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useComplianceSubmissions() {
  const [mounted, setMounted] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, getComplianceSubmissions, getComplianceSubmissions);
  useEffect(() => setMounted(true), []);
  return mounted ? snapshot : seed;
}

export function useComplianceSubmission(id: string) {
  return useComplianceSubmissions().find((item) => item.id === id) ?? null;
}
