// Starting data for the approval stores, written into the database by the server the first time a
// store is loaded. Doing it server-side means no browser ever has to upload "approved" items, which
// the review rules would (rightly) refuse. Loaded with a dynamic import from api.functions.ts.
import { eventDocSeed } from "@/lib/event-requirements";
import { complianceSeed } from "@/lib/org-compliance";
import { postApprovalSeed } from "@/lib/post-approvals";
import { seedTransitionWorkflows, seedWorkflows } from "@/lib/workflows";
import type { SyncedKey } from "@/lib/synced-keys";

export const SERVER_SEEDS: Partial<Record<SyncedKey, () => unknown>> = {
  "umunity.workflows.v1": seedWorkflows,
  "umunity.transitions.v1": seedTransitionWorkflows,
  "umunity.org-compliance.v1": () => complianceSeed,
  "umunity.post-approvals.v1": () => postApprovalSeed,
  "umunity.event-requirements.v1": () => eventDocSeed,
};
