// Client-side notifications store (demo, localStorage-backed)
import { useEffect, useState, useSyncExternalStore } from "react";

export type NotifCategory = "event" | "announcement" | "comment-reply" | "rsvp" | "general";

export type AppNotif = {
  id: string;
  title: string;
  meta: string;
  category: NotifCategory;
  unread: boolean;
  createdAt: number;
  href?: string;
};

const KEY = "umunity.notifications.v1";
const EVENT = "umunity:notifications";

const seed: AppNotif[] = [
  { id: "n1", title: "Marvin Lim replied to your comment on UM Innovation Summit 2026", meta: "30m ago", category: "comment-reply", unread: true, createdAt: Date.now() - 30 * 60_000, href: "/student" },
  { id: "n2", title: "UM CS Society pinned a new announcement", meta: "2h ago", category: "announcement", unread: true, createdAt: Date.now() - 2 * 3_600_000, href: "/org/cs-society" },
  { id: "n3", title: "Innovation Summit RSVP confirmed", meta: "4h ago", category: "rsvp", unread: true, createdAt: Date.now() - 4 * 3_600_000, href: "/student/events" },
  { id: "n4", title: "New event: Eco Run for the Planet", meta: "Yesterday", category: "event", unread: true, createdAt: Date.now() - 86_400_000, href: "/student/events" },
  { id: "n5", title: "UM Eco Warriors posted a campus update", meta: "Yesterday", category: "announcement", unread: false, createdAt: Date.now() - 86_400_000, href: "/org/eco-warriors" },
  { id: "n6", title: "Jana Cruz replied to your comment", meta: "2 days ago", category: "comment-reply", unread: false, createdAt: Date.now() - 2 * 86_400_000, href: "/student" },
  { id: "n7", title: "Welcome to UMUnity!", meta: "3 days ago", category: "general", unread: false, createdAt: Date.now() - 3 * 86_400_000 },
];

function read(): AppNotif[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as AppNotif[];
  } catch {
    return seed;
  }
}

function write(list: AppNotif[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function getNotifications(): AppNotif[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
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

export function markAllRead() {
  write(read().map((n) => ({ ...n, unread: false })));
}

export function removeNotification(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function addNotification(input: Omit<AppNotif, "id" | "createdAt" | "unread"> & { unread?: boolean }) {
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
  if (href.startsWith("/org/")) return "/adviser";
  if (href.startsWith("/leader/workflows/")) return href;
  if (href.startsWith("/adviser/workflows/")) return href;
  return "/adviser";
}

export function resolveAdmin2NotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/admin2/workflows/")) return href;
  return "/admin2";
}

export function resolveAdmin1NotificationHref(href?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith("/admin1/workflows/")) return href;
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

export function useNotifications(): AppNotif[] {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snap = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getNotifications()),
    () => JSON.stringify(seed),
  );
  return hydrated ? (JSON.parse(snap) as AppNotif[]) : seed;
}
