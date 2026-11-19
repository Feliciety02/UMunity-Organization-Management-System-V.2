// Student organization memberships and pending join requests.
// Stored in the database (org_members / membership_requests tables); this module keeps a browser
// cache for instant UI, updates it optimistically, and rolls back if the server refuses.
import { toast } from "sonner";
import {
  cancelMembershipRequestFn,
  leaveOrganizationFn,
  myMembershipsFn,
  requestMembershipFn,
} from "@/lib/api.functions";
import { registerRefresher } from "@/lib/cloud-storage";
import { createLocalStore } from "@/lib/local-store";

export type MembershipStatus = "member" | "pending" | "none";

type MembershipState = {
  member: Record<string, string>; // slug -> "Member since" label
  pending: Record<string, string>; // slug -> requested-at label
};

const store = createLocalStore<MembershipState>("umunity.memberships.v1", {
  member: {},
  pending: {},
});

export async function refreshMemberships() {
  store.write(await myMembershipsFn());
}
registerRefresher(refreshMemberships);

function monthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function membershipStatus(state: MembershipState, slug: string): MembershipStatus {
  if (state.member[slug]) return "member";
  if (state.pending[slug]) return "pending";
  return "none";
}

/** Apply the change locally now, confirm with the server, and undo it if the server says no. */
function optimistic(
  change: (s: MembershipState) => MembershipState,
  call: () => Promise<{ ok: true } | { ok: false; error: string }>,
) {
  const before = store.read();
  store.write(change(before));
  call()
    .then((res) => {
      if (!res.ok) throw new Error(res.error);
    })
    .catch((err: unknown) => {
      store.write(before);
      toast.error("That didn't go through", {
        description:
          err instanceof Error && err.message
            ? err.message
            : "Check your connection and try again.",
      });
    })
    .finally(() => void refreshMemberships().catch(() => {}));
}

export function requestMembership(slug: string, reason = "") {
  optimistic(
    (s) => ({ ...s, pending: { ...s.pending, [slug]: monthLabel() } }),
    () => requestMembershipFn({ data: { slug, reason } }),
  );
}

export function cancelMembershipRequest(slug: string) {
  optimistic(
    (s) => {
      const pending = { ...s.pending };
      delete pending[slug];
      return { ...s, pending };
    },
    () => cancelMembershipRequestFn({ data: { slug } }),
  );
}

export function leaveOrganization(slug: string) {
  optimistic(
    (s) => {
      const member = { ...s.member };
      delete member[slug];
      return { ...s, member };
    },
    () => leaveOrganizationFn({ data: { slug } }),
  );
}

export const useMemberships = store.useStore;
