// Client-side RSVP store (demo, localStorage-backed)
import { useEffect, useState, useSyncExternalStore } from "react";
import { addNotification } from "./notifications";

export type RsvpStatus = "going" | "maybe" | "cancelled";

export type RsvpRecord = {
  eventTitle: string;
  status: RsvpStatus;
  attendeeName: string;
  attendeeEmail: string;
  program?: string;
  updatedAt: number;
};

const KEY = "umunity.rsvps.v1";
const EVENT = "umunity:rsvps";

const seed: RsvpRecord[] = [
  { eventTitle: "UM Innovation Summit 2026", status: "going", attendeeName: "Althea Dumaguete", attendeeEmail: "student@um.edu.ph", program: "BS CS · 3rd Yr", updatedAt: Date.now() - 86_400_000 },
  { eventTitle: "UM Innovation Summit 2026", status: "going", attendeeName: "Marvin Lim", attendeeEmail: "marvin@um.edu.ph", program: "BS CS · 1st Yr", updatedAt: Date.now() - 70_000_000 },
  { eventTitle: "UM Innovation Summit 2026", status: "maybe", attendeeName: "Jana Cruz", attendeeEmail: "jana@um.edu.ph", program: "BS IT · 2nd Yr", updatedAt: Date.now() - 60_000_000 },
  { eventTitle: "Hack Night Vol. 3", status: "going", attendeeName: "Karl Mendez", attendeeEmail: "karl@um.edu.ph", program: "BS CS · 4th Yr", updatedAt: Date.now() - 50_000_000 },
  { eventTitle: "Eco Run for the Planet", status: "maybe", attendeeName: "Althea Dumaguete", attendeeEmail: "student@um.edu.ph", program: "BS CS · 3rd Yr", updatedAt: Date.now() - 40_000_000 },
];

function read(): RsvpRecord[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as RsvpRecord[];
  } catch {
    return seed;
  }
}

function write(list: RsvpRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function getAllRsvps(): RsvpRecord[] {
  return read();
}

export function getMyRsvp(eventTitle: string, email: string): RsvpRecord | undefined {
  return read().find((r) => r.eventTitle === eventTitle && r.attendeeEmail === email);
}

export function getEventRsvps(eventTitle: string): RsvpRecord[] {
  return read().filter((r) => r.eventTitle === eventTitle);
}

export function setRsvp(record: Omit<RsvpRecord, "updatedAt">) {
  const list = read();
  const idx = list.findIndex((r) => r.eventTitle === record.eventTitle && r.attendeeEmail === record.attendeeEmail);
  const next: RsvpRecord = { ...record, updatedAt: Date.now() };
  if (idx === -1) list.push(next);
  else list[idx] = next;
  write(list);
  addNotification({
    title:
      record.status === "going"
        ? `RSVP confirmed: ${record.eventTitle}`
        : record.status === "maybe"
          ? `Marked Maybe: ${record.eventTitle}`
          : `RSVP cancelled: ${record.eventTitle}`,
    meta: "Just now",
    category: "rsvp",
    href: `/student/events?event=${encodeURIComponent(slugify(record.eventTitle))}`,
  });
  return next;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function cancelRsvp(eventTitle: string, email: string) {
  const existing = getMyRsvp(eventTitle, email);
  if (!existing) return;
  setRsvp({ ...existing, status: "cancelled" });
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

export function useRsvps(): RsvpRecord[] {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snap = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(read()),
    () => JSON.stringify(seed),
  );
  return hydrated ? (JSON.parse(snap) as RsvpRecord[]) : seed;
}
