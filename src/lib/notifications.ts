// Client-side notifications store (saved to the database via cloud-storage)
import { cloudStorage } from "@/lib/cloud-storage";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Role } from "@/lib/auth";

export type NotifCategory =
  | "event"
  | "announcement"
  | "comment-reply"
  | "rsvp"
  | "general"
  | "system";

export type AppNotif = {
  id: string;
  title: string;
  meta: string;
  category: NotifCategory;
  unread: boolean;
  createdAt: number;
  href?: string;
  /** Which workspace sees this notification. Inferred from `href` when omitted. */
  audience?: Role;
};

// v2: notifications are scoped per role (v1 showed student items to every role).
const KEY = "umunity.notifications.v2";
const EVENT = "umunity:notifications";

const studentSeed: AppNotif[] = [
  {
    id: "n1",
    title: "Marvin Lim replied to your comment on UM Innovation Summit 2026",
    meta: "30m ago",
    category: "comment-reply",
    unread: true,
    createdAt: Date.now() - 30 * 60_000,
    href: "/student",
  },
  {
    id: "n2",
    title: "UM CS Society pinned a new announcement",
    meta: "2h ago",
    category: "announcement",
    unread: true,
    createdAt: Date.now() - 2 * 3_600_000,
    href: "/org/cs-society",
  },
  {
    id: "n3",
    title: "Innovation Summit RSVP confirmed",
    meta: "4h ago",
    category: "rsvp",
    unread: true,
    createdAt: Date.now() - 4 * 3_600_000,
    href: "/student/events",
  },
  {
    id: "n4",
    title: "New event: Eco Run for the Planet",
    meta: "Yesterday",
    category: "event",
    unread: true,
    createdAt: Date.now() - 86_400_000,
    href: "/student/events",
  },
  {
    id: "n5",
    title: "UM Eco Warriors posted a campus update",
    meta: "Yesterday",
    category: "announcement",
    unread: false,
    createdAt: Date.now() - 86_400_000,
    href: "/org/eco-warriors",
  },
  {
    id: "n6",
    title: "Jana Cruz replied to your comment",
    meta: "2 days ago",
    category: "comment-reply",
    unread: false,
    createdAt: Date.now() - 2 * 86_400_000,
    href: "/student",
  },
  {
    id: "n7",
    title: "Welcome to UMunity!",
    meta: "3 days ago",
    category: "general",
    unread: false,
    createdAt: Date.now() - 3 * 86_400_000,
  },
];

const roleSeed = (
  audience: Role,
  items: Array<Pick<AppNotif, "title" | "meta" | "category" | "href"> & { unread?: boolean; ageMin: number }>,
): AppNotif[] =>
  items.map((item, index) => ({
    id: `${audience}-seed-${index + 1}`,
    title: item.title,
    meta: item.meta,
    category: item.category,
    href: item.href,
    unread: item.unread ?? true,
    createdAt: Date.now() - item.ageMin * 60_000,
    audience,
  }));

const seed: AppNotif[] = [
  ...studentSeed.map((n) => ({ ...n, audience: "student" as const })),
  ...roleSeed("leader", [
    { title: "4 membership requests pending review", meta: "1h ago", category: "general", href: "/leader/requests", ageMin: 60 },
    { title: "New comments on your posts", meta: "2h ago", category: "comment-reply", href: "/leader/comments", ageMin: 120 },
    { title: "Innovation Summit has 184 RSVPs", meta: "3h ago", category: "rsvp", href: "/leader/attendees", ageMin: 180 },
    { title: "Treasurer published a new budget update", meta: "Yesterday", category: "announcement", href: "/leader/feed", ageMin: 1_440 },
    { title: "Monthly engagement report ready", meta: "2 days ago", category: "system", href: "/leader/attendance", unread: false, ageMin: 2_880 },
  ]),
  ...roleSeed("adviser", [
    { title: "Innovation Summit is waiting for adviser review", meta: "Pending now", category: "event", href: "/adviser", ageMin: 10 },
    { title: "Hack Night moved to Admin 2 after your approval", meta: "4h ago", category: "event", href: "/adviser", ageMin: 240 },
    { title: "A leader responded to your revision note", meta: "Yesterday", category: "comment-reply", href: "/adviser/review-center", unread: false, ageMin: 1_440 },
  ]),
  ...roleSeed("admin2", [
    { title: "Hack Night is ready for Admin 2 compliance review", meta: "Queue update", category: "event", href: "/admin2", ageMin: 30 },
    { title: "Cultural Night moved to Admin 1 after your approval", meta: "Yesterday", category: "event", href: "/admin2/monitoring", unread: false, ageMin: 1_440 },
  ]),
  ...roleSeed("admin1", [
    { title: "Cultural Night is ready for final approval", meta: "Pending final authority", category: "event", href: "/admin1/authority", ageMin: 45 },
    { title: "Officer transition season starts next month", meta: "Governance", category: "system", href: "/admin1/transitions", unread: false, ageMin: 2_880 },
  ]),
  ...roleSeed("admin", [
    { title: "Reported posts awaiting moderation", meta: "20m ago", category: "system", href: "/admin/reported-posts", ageMin: 20 },
    { title: "5 organizations awaiting verification", meta: "30m ago", category: "system", href: "/admin/organizations", ageMin: 30 },
    { title: "Spike in event RSVPs this week (+24%)", meta: "2h ago", category: "rsvp", href: "/admin/analytics", ageMin: 120 },
    { title: "New user signups today: 87", meta: "4h ago", category: "general", href: "/admin/users", ageMin: 240 },
    { title: "Weekly analytics report generated", meta: "2 days ago", category: "system", href: "/admin/reports", unread: false, ageMin: 2_880 },
  ]),
];

/** Resolve which role a notification belongs to, from its explicit audience or its link. */
export function audienceOf(n: Pick<AppNotif, "audience" | "href">): Role {
  if (n.audience) return n.audience;
  const href = n.href ?? "";
  if (href.startsWith("/leader")) return "leader";
  if (href.startsWith("/adviser")) return "adviser";
  if (href.startsWith("/admin2")) return "admin2";
  if (href.startsWith("/admin1")) return "admin1";
  if (href.startsWith("/admin")) return "admin";
  return "student";
}

function read(): AppNotif[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = cloudStorage.getItem(KEY);
    if (!raw) {
      cloudStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as AppNotif[];
  } catch {
    return seed;
  }
}

function write(list: AppNotif[]) {
  if (typeof window === "undefined") return;
  cloudStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function getNotifications(role?: Role): AppNotif[] {
  return read()
    .filter((n) => !role || audienceOf(n) === role)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function unreadCount(list?: AppNotif[]): number {
  return (list ?? getNotifications()).filter((n) => n.unread).length;
}

export function markRead(id: string) {
  write(read().map((n) => (n.id === id ? { ...n, unread: false } : n)));
}

export function markUnread(id: string) {
  write(read().map((n) => (n.id === id ? { ...n, unread: true } : n)));
}

export function markAllRead(role?: Role) {
  write(read().map((n) => (!role || audienceOf(n) === role ? { ...n, unread: false } : n)));
}

export function removeNotification(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function addNotification(
  input: Omit<AppNotif, "id" | "createdAt" | "unread"> & { unread?: boolean },
) {
  const n: AppNotif = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    unread: input.unread ?? true,
    ...input,
  };
  write([n, ...read()]);
  return n;
}

export function resolveStudentNotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/org/")) return href.replace("/org/", "/student/org/");
  return href;
}

export function resolveLeaderNotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/org/")) return "/leader/organization";
  if (href.startsWith("/student/events")) return "/leader/manage-events";
  if (href === "/student") return "/leader/feed";
  return href;
}

export function resolveAdminNotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/org/")) return "/admin/organizations";
  if (href.startsWith("/student/events")) return "/admin/events";
  if (href === "/student") return "/admin/logs";
  return href;
}

export function resolveAdviserNotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/adviser")) return href;
  return "/adviser";
}

export function resolveAdmin2NotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/admin2")) return href;
  return "/admin2";
}

export function resolveAdmin1NotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/admin1")) return href;
  return "/admin1";
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

export function useNotifications(role?: Role): AppNotif[] {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const fallback = role ? seed.filter((n) => audienceOf(n) === role) : seed;
  const snap = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getNotifications(role)),
    () => JSON.stringify(fallback),
  );
  return hydrated ? (JSON.parse(snap) as AppNotif[]) : fallback;
}
