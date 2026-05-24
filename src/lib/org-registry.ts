import { useEffect, useState, useSyncExternalStore } from "react";
import { organizations, officers } from "@/data/orgs";
import { addNotification } from "@/lib/notifications";

export type OrgLifecycleStatus = "recognized" | "probationary" | "pending_review" | "disbanded";
export type OrgAccreditationStatus = "active" | "renewal_pending" | "under_review" | "suspended";

export type OrgRegistryHistoryEntry = {
  id: string;
  action: "seeded" | "status_changed" | "accreditation_updated";
  by: string;
  note: string;
  createdAt: number;
};

export type OrgRegistryRecord = {
  slug: string;
  name: string;
  category: string;
  members: number;
  adviserName: string;
  lifecycleStatus: OrgLifecycleStatus;
  accreditationStatus: OrgAccreditationStatus;
  accreditationAcademicYear: string;
  lastDecisionAt: number;
  history: OrgRegistryHistoryEntry[];
};

const KEY = "umunity.org-registry.v1";
const EVENT = "umunity:org-registry";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function currentAcademicYear() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function defaultAdviserName(slug: string) {
  return officers[slug]?.find((entry) => entry.role.toLowerCase() === "adviser")?.name ?? "Prof. Elena Tan";
}

const seed: OrgRegistryRecord[] = organizations.map((org, index) => ({
  slug: org.slug,
  name: org.name,
  category: org.category,
  members: org.members,
  adviserName: defaultAdviserName(org.slug),
  lifecycleStatus:
    org.slug === "eco-warriors" ? "probationary" : org.slug === "theatre-guild" ? "pending_review" : "recognized",
  accreditationStatus:
    org.slug === "theatre-guild" ? "renewal_pending" : org.slug === "eco-warriors" ? "under_review" : "active",
  accreditationAcademicYear: currentAcademicYear(),
  lastDecisionAt: Date.now() - (index + 1) * 86_400_000,
  history: [
    {
      id: nowId("org-history"),
      action: "seeded",
      by: "System",
      note: "Organization registry initialized for workflow governance.",
      createdAt: Date.now() - (index + 1) * 86_400_000,
    },
  ],
}));

function read() {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as OrgRegistryRecord[];
  } catch {
    return seed;
  }
}

function write(list: OrgRegistryRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function formatOrgLifecycleStatus(status: OrgLifecycleStatus) {
  switch (status) {
    case "recognized":
      return "Recognized";
    case "probationary":
      return "Probationary";
    case "pending_review":
      return "Pending Review";
    case "disbanded":
      return "Disbanded";
  }
}

export function orgLifecycleTone(status: OrgLifecycleStatus): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "recognized":
      return "success";
    case "probationary":
      return "warning";
    case "pending_review":
      return "info";
    case "disbanded":
      return "danger";
  }
}

export function formatOrgAccreditationStatus(status: OrgAccreditationStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "renewal_pending":
      return "Renewal Pending";
    case "under_review":
      return "Under Review";
    case "suspended":
      return "Suspended";
  }
}

export function orgAccreditationTone(status: OrgAccreditationStatus): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "renewal_pending":
      return "warning";
    case "under_review":
      return "info";
    case "suspended":
      return "danger";
  }
}

export function getOrgRegistry() {
  return read().sort((a, b) => a.name.localeCompare(b.name));
}

export function getOrgRecord(slug: string) {
  return read().find((org) => org.slug === slug) ?? null;
}

function updateRecord(slug: string, updater: (record: OrgRegistryRecord) => OrgRegistryRecord) {
  const next = read().map((record) => (record.slug === slug ? updater({ ...record }) : record));
  write(next);
  return next.find((record) => record.slug === slug) ?? null;
}

export function setOrgLifecycleStatus(
  slug: string,
  input: { status: OrgLifecycleStatus; by: string; note: string; accreditationStatus?: OrgAccreditationStatus },
) {
  return updateRecord(slug, (record) => ({
    ...record,
    lifecycleStatus: input.status,
    accreditationStatus: input.accreditationStatus ?? record.accreditationStatus,
    lastDecisionAt: Date.now(),
    history: [
      {
        id: nowId("org-history"),
        action: "status_changed",
        by: input.by,
        note: input.note,
        createdAt: Date.now(),
      },
      ...record.history,
    ],
  }));
}

export function applyAccreditationDecision(
  slug: string,
  input: {
    by: string;
    academicYear: string;
    status: OrgAccreditationStatus;
    lifecycleStatus?: OrgLifecycleStatus;
    note: string;
  },
) {
  return updateRecord(slug, (record) => ({
    ...record,
    accreditationStatus: input.status,
    lifecycleStatus: input.lifecycleStatus ?? record.lifecycleStatus,
    accreditationAcademicYear: input.academicYear,
    lastDecisionAt: Date.now(),
    history: [
      {
        id: nowId("org-history"),
        action: "accreditation_updated",
        by: input.by,
        note: input.note,
        createdAt: Date.now(),
      },
      ...record.history,
    ],
  }));
}

export function sendOrgRegistryNotification(slug: string, title: string, meta: string) {
  addNotification({
    title,
    meta,
    category: "system",
    href: `/admin1/organizations/${slug}`,
  });
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useOrgRegistry() {
  const [mounted, setMounted] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, getOrgRegistry, getOrgRegistry);
  useEffect(() => setMounted(true), []);
  return mounted ? snapshot : seed;
}

export function useOrgRecord(slug: string) {
  return useOrgRegistry().find((record) => record.slug === slug) ?? null;
}
