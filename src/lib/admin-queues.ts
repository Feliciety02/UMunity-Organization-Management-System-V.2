// Legacy admin review queues shared by the dashboard and the management pages (saved to the database via cloud-storage).
import { createLocalStore } from "@/lib/local-store";
import { events } from "@/data/events";

export type PendingOrg = {
  id: string;
  name: string;
  category: string;
  submittedBy: string;
  submitted: string;
};
export type PendingEvent = { title: string };

const orgStore = createLocalStore<PendingOrg[]>("umunity.admin.pending-orgs.v1", [
  {
    id: "drone",
    name: "UM Drone Society",
    category: "Tech",
    submittedBy: "Aldous P.",
    submitted: "May 06",
  },
  {
    id: "agritech",
    name: "UM AgriTech Hub",
    category: "Agriculture",
    submittedBy: "Liza M.",
    submitted: "May 04",
  },
  {
    id: "gamedev",
    name: "UM Game Dev Guild",
    category: "Tech",
    submittedBy: "Jared K.",
    submitted: "May 02",
  },
  {
    id: "wellness",
    name: "UM Mental Wellness Circle",
    category: "Wellness",
    submittedBy: "Faye R.",
    submitted: "Apr 28",
  },
  {
    id: "astronomy",
    name: "UM Astronomy Club",
    category: "Science",
    submittedBy: "Rian C.",
    submitted: "Apr 25",
  },
]);

const eventDecisionStore = createLocalStore<Record<string, "Approved" | "Rejected">>(
  "umunity.admin.event-decisions.v1",
  {},
);

export function resolvePendingOrg(id: string) {
  orgStore.update((list) => list.filter((o) => o.id !== id));
}

export function decideEvent(title: string, decision: "Approved" | "Rejected") {
  eventDecisionStore.update((d) => ({ ...d, [title]: decision }));
}

export const usePendingOrgs = orgStore.useStore;
export const useEventDecisions = eventDecisionStore.useStore;

export function orgInitials(name: string) {
  return name
    .split(" ")
    .filter((w) => w !== "UM")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

// Events after the first two start in the review queue until an admin decides.
const PENDING_EVENT_TITLES = events.slice(2, 5).map((e) => e.title);

export type EventReviewStatus = "Approved" | "Rejected" | "Pending";

export function eventReviewStatus(
  title: string,
  decisions: Record<string, "Approved" | "Rejected">,
): EventReviewStatus {
  if (decisions[title]) return decisions[title];
  return PENDING_EVENT_TITLES.includes(title) ? "Pending" : "Approved";
}
