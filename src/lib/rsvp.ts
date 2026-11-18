// Client-side RSVP store (saved to the database via cloud-storage)
import { addNotification } from "./notifications";
import { slugify } from "@/lib/text";
import { createLocalStore } from "@/lib/local-store";

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

const seed: RsvpRecord[] = [
  { eventTitle: "UM Innovation Summit 2026", status: "going", attendeeName: "Althea Dumaguete", attendeeEmail: "student@um.edu.ph", program: "BS CS - 3rd Yr", updatedAt: Date.now() - 86_400_000 },
  { eventTitle: "UM Innovation Summit 2026", status: "going", attendeeName: "Marvin Lim", attendeeEmail: "marvin@um.edu.ph", program: "BS CS - 1st Yr", updatedAt: Date.now() - 70_000_000 },
  { eventTitle: "UM Innovation Summit 2026", status: "maybe", attendeeName: "Jana Cruz", attendeeEmail: "jana@um.edu.ph", program: "BS IT - 2nd Yr", updatedAt: Date.now() - 60_000_000 },
  { eventTitle: "Hack Night Vol. 3", status: "going", attendeeName: "Karl Mendez", attendeeEmail: "karl@um.edu.ph", program: "BS CS - 4th Yr", updatedAt: Date.now() - 50_000_000 },
  { eventTitle: "Eco Run for the Planet", status: "maybe", attendeeName: "Althea Dumaguete", attendeeEmail: "student@um.edu.ph", program: "BS CS - 3rd Yr", updatedAt: Date.now() - 40_000_000 },
];

const store = createLocalStore<RsvpRecord[]>(KEY, seed, { saveSeed: true });
const read = store.read;
const write = store.write;

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

export function useRsvps(): RsvpRecord[] {
  return store.useSelect(read, seed);
}
