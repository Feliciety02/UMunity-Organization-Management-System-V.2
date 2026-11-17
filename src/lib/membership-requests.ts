// Membership requests waiting on the org leader. Stored in the database (membership_requests);
// students' requests from the Join button land here, and approving one makes the student a member.
import { toast } from "sonner";
import { orgMembersFn, orgRequestsFn, removeOrgMemberFn, resolveMembershipRequestFn, setMemberStatusFn } from "@/lib/api.functions";
import { registerRefresher } from "@/lib/cloud-storage";
import { createLocalStore } from "@/lib/local-store";

export type MembershipRequest = {
  id: string;
  name: string;
  program: string;
  reason: string;
  time: string;
};

export type MemberStatus = "Active" | "Inactive";
export type OrgMember = { name: string; email: string; program: string; since: string; title: string; status: MemberStatus; avatarColor: string };

type Cache = { requests: Array<Omit<MembershipRequest, "time"> & { createdAt: number }>; members: OrgMember[] };

const store = createLocalStore<Cache>("umunity.membership-requests.v1", { requests: [], members: [] });

export async function refreshMembershipRequests() {
  const [requests, members] = await Promise.all([orgRequestsFn(), orgMembersFn()]);
  store.write({ requests, members });
}
registerRefresher(refreshMembershipRequests);

/** "Today, 10:14 AM", "Yesterday", or a date. */
export function requestTimeLabel(ms: number, now = Date.now()) {
  const d = new Date(ms);
  const today = new Date(now);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (ms >= startOfToday) return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (ms >= startOfToday - 24 * 60 * 60 * 1000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Apply a change locally now, confirm with the server, and undo it if the server says no. */
function optimistic(change: (c: Cache) => Cache, call: () => Promise<{ ok: true } | { ok: false; error: string }>) {
  const before = store.read();
  store.write(change(before));
  call()
    .then((res) => {
      if (!res.ok) throw new Error(res.error);
    })
    .catch((err: unknown) => {
      store.write(before);
      toast.error("That didn't go through", {
        description: err instanceof Error && err.message ? err.message : "Check your connection and try again.",
      });
    })
    .finally(() => void refreshMembershipRequests().catch(() => {}));
}

/** Approve (the student becomes a member) or deny a request. */
export function resolveMembershipRequest(id: string, approve: boolean) {
  optimistic((c) => ({ ...c, requests: c.requests.filter((r) => r.id !== id) }), () => resolveMembershipRequestFn({ data: { id, approve } }));
}

export function setMemberStatus(email: string, status: MemberStatus) {
  optimistic(
    (c) => ({ ...c, members: c.members.map((m) => (m.email === email ? { ...m, status } : m)) }),
    () => setMemberStatusFn({ data: { email, status } }),
  );
}

export function removeOrgMember(email: string) {
  optimistic((c) => ({ ...c, members: c.members.filter((m) => m.email !== email) }), () => removeOrgMemberFn({ data: { email } }));
}

export function useMembershipRequests(): MembershipRequest[] {
  return store.useStore().requests.map((r) => ({ ...r, time: requestTimeLabel(r.createdAt) }));
}

/** Members of the leader's org. */
export function useOrgMembers(): OrgMember[] {
  return store.useStore().members;
}
