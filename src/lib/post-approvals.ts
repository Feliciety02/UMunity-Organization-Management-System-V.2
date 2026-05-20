import { useEffect, useState, useSyncExternalStore } from "react";
import { addNotification } from "@/lib/notifications";
import type { WorkflowActor } from "@/lib/workflows";

export type PostApprovalStatus =
  | "draft"
  | "pending_adviser"
  | "revision_requested"
  | "pending_admin2"
  | "published";

export type PostApprovalType = "general" | "announcement" | "event";
export type PostVisibility = "public" | "members";

export type PostApprovalComment = {
  id: string;
  authorRole: WorkflowActor["role"];
  authorName: string;
  message: string;
  createdAt: number;
};

export type PostApprovalHistory = {
  id: string;
  action: "created" | "submitted" | "commented" | "revision_requested" | "approved" | "published";
  byRole: WorkflowActor["role"];
  byName: string;
  note?: string;
  createdAt: number;
};

export type PostApproval = {
  id: string;
  orgName: string;
  orgSlug: string;
  createdBy: string;
  type: PostApprovalType;
  visibility: PostVisibility;
  pinned: boolean;
  title: string;
  content: string;
  imageLabel?: string;
  status: PostApprovalStatus;
  createdAt: number;
  updatedAt: number;
  comments: PostApprovalComment[];
  history: PostApprovalHistory[];
};

const KEY = "umunity.post-approvals.v1";
const EVENT = "umunity:post-approvals";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const seed: PostApproval[] = [
  {
    id: "post-approval-1",
    orgName: "UM Computer Studies Society",
    orgSlug: "cs-society",
    createdBy: "Marco Reyes",
    type: "announcement",
    visibility: "public",
    pinned: true,
    title: "Officer assembly this Friday",
    content: "Adviser-facing draft for the officer assembly notice before it reaches the wider student audience.",
    imageLabel: "assembly-banner.png",
    status: "pending_adviser",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 60 * 60 * 1000,
    comments: [],
    history: [
      {
        id: "ph-1",
        action: "created",
        byRole: "leader",
        byName: "Marco Reyes",
        note: "Draft created from leader dashboard.",
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
      },
      {
        id: "ph-2",
        action: "submitted",
        byRole: "leader",
        byName: "Marco Reyes",
        note: "Submitted to adviser review.",
        createdAt: Date.now() - 5 * 60 * 60 * 1000 + 2 * 60 * 1000,
      },
    ],
  },
  {
    id: "post-approval-2",
    orgName: "UM Computer Studies Society",
    orgSlug: "cs-society",
    createdBy: "Marco Reyes",
    type: "event",
    visibility: "members",
    pinned: false,
    title: "Hack Night volunteer call",
    content: "Need marshals, registration table leads, and venue setup support for Hack Night Vol. 3.",
    status: "pending_admin2",
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
    updatedAt: Date.now() - 8 * 60 * 60 * 1000,
    comments: [
      {
        id: "pc-1",
        authorRole: "adviser",
        authorName: "Prof. Elena Tan",
        message: "Copy looks good. Forwarding to Admin 2 for compliance check.",
        createdAt: Date.now() - 8 * 60 * 60 * 1000,
      },
    ],
    history: [
      {
        id: "ph-3",
        action: "created",
        byRole: "leader",
        byName: "Marco Reyes",
        createdAt: Date.now() - 26 * 60 * 60 * 1000,
      },
      {
        id: "ph-4",
        action: "submitted",
        byRole: "leader",
        byName: "Marco Reyes",
        createdAt: Date.now() - 25 * 60 * 60 * 1000,
      },
      {
        id: "ph-5",
        action: "approved",
        byRole: "adviser",
        byName: "Prof. Elena Tan",
        note: "Forwarded to Admin 2.",
        createdAt: Date.now() - 8 * 60 * 60 * 1000,
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
    return JSON.parse(raw) as PostApproval[];
  } catch {
    return seed;
  }
}

function write(list: PostApproval[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function formatPostApprovalStatus(status: PostApprovalStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_adviser":
      return "Pending Adviser";
    case "revision_requested":
      return "Revision Requested";
    case "pending_admin2":
      return "Pending Admin 2";
    case "published":
      return "Published";
  }
}

export function postApprovalTone(status: PostApprovalStatus): "neutral" | "info" | "warning" | "danger" | "success" {
  switch (status) {
    case "draft":
      return "neutral";
    case "pending_adviser":
      return "info";
    case "revision_requested":
      return "danger";
    case "pending_admin2":
      return "warning";
    case "published":
      return "success";
  }
}

export function getPostApprovals() {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPostApproval(id: string) {
  return read().find((item) => item.id === id) ?? null;
}

export function createPostApproval(input: {
  orgName: string;
  orgSlug: string;
  createdBy: string;
  type: PostApprovalType;
  visibility: PostVisibility;
  pinned: boolean;
  title: string;
  content: string;
  imageLabel?: string;
  submit?: boolean;
}) {
  const approval: PostApproval = {
    id: nowId("post"),
    orgName: input.orgName,
    orgSlug: input.orgSlug,
    createdBy: input.createdBy,
    type: input.type,
    visibility: input.visibility,
    pinned: input.pinned,
    title: input.title,
    content: input.content,
    imageLabel: input.imageLabel,
    status: input.submit ? "pending_adviser" : "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    comments: [],
    history: [
      {
        id: nowId("history"),
        action: "created",
        byRole: "leader",
        byName: input.createdBy,
        note: input.submit ? "Post created and sent for approval." : "Draft saved.",
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
  write([approval, ...read()]);
  if (input.submit) {
    addNotification({
      title: `${approval.orgName} submitted a post for adviser review`,
      meta: approval.title || approval.type,
      category: "announcement",
      href: `/adviser/posts/${approval.id}`,
    });
  }
  return approval;
}

function updateApproval(id: string, updater: (approval: PostApproval) => PostApproval) {
  const next = read().map((approval) => (approval.id === id ? updater({ ...approval }) : approval));
  write(next);
  return next.find((approval) => approval.id === id) ?? null;
}

export function addPostApprovalComment(id: string, actor: WorkflowActor, message: string) {
  return updateApproval(id, (approval) => ({
    ...approval,
    updatedAt: Date.now(),
    comments: [
      {
        id: nowId("comment"),
        authorRole: actor.role,
        authorName: actor.name,
        message,
        createdAt: Date.now(),
      },
      ...approval.comments,
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
      ...approval.history,
    ],
  }));
}

export function requestPostApprovalRevision(id: string, actor: WorkflowActor, note: string) {
  return updateApproval(id, (approval) => {
    addNotification({
      title: `${approval.orgName} post needs revisions`,
      meta: actor.name,
      category: "announcement",
      href: `/leader/post-approvals/${approval.id}`,
    });
    return {
      ...approval,
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
        ...approval.comments,
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
        ...approval.history,
      ],
    };
  });
}

export function approvePostApproval(id: string, actor: WorkflowActor) {
  return updateApproval(id, (approval) => {
    const nextStatus: PostApprovalStatus = actor.role === "adviser" ? "pending_admin2" : "published";
    addNotification({
      title:
        actor.role === "adviser"
          ? `${approval.orgName} post moved to Admin 2`
          : `${approval.orgName} post is now published`,
      meta: approval.title || approval.type,
      category: "announcement",
      href: actor.role === "adviser" ? `/admin2/posts/${approval.id}` : `/leader/post-approvals/${approval.id}`,
    });
    return {
      ...approval,
      status: nextStatus,
      updatedAt: Date.now(),
      history: [
        {
          id: nowId("history"),
          action: actor.role === "adviser" ? "approved" : "published",
          byRole: actor.role,
          byName: actor.name,
          note: actor.role === "adviser" ? "Forwarded to Admin 2." : "Published after review.",
          createdAt: Date.now(),
        },
        ...approval.history,
      ],
    };
  });
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function usePostApprovals() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getPostApprovals()),
    () => JSON.stringify(seed),
  );
  return hydrated ? (JSON.parse(snapshot) as PostApproval[]) : seed;
}

export function usePostApproval(id: string) {
  return usePostApprovals().find((approval) => approval.id === id) ?? null;
}
