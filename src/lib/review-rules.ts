// Server-enforced rules for the approval stores (event workflows, officer transitions, compliance,
// post approvals, event requirements). Every save of one of these items is checked here: the server
// compares the stored item with the new one and refuses steps the signed-in role may not take.
// Pure module (no imports besides types) so the server and the tests share it.
import type { Role } from "@/lib/demo-users";

type Item = Record<string, unknown>;

export type ReviewRule = {
  /** Field holding the review status. */
  statusField: "status" | "reviewStatus";
  /** Review stages in order, ending with the final approved state. */
  chain: readonly string[];
  /** Field naming the owning org: a full name, or a short code like "UMCSS". */
  orgField: "orgName" | "orgShort";
  /** Fields the owning leader may also change while the item is in `ownerFieldsWhen` statuses. */
  ownerFields?: readonly string[];
  ownerFieldsWhen?: readonly string[];
  /** Fields the reviewer of the current stage may change (besides status, comments and history). */
  reviewerFields?: readonly string[];
  /** Event workflows have a second review chain for the post-event closeout. */
  closeout?: boolean;
};

const FOUR_STAGE = ["pending_adviser", "pending_admin2", "pending_admin1", "approved"] as const;

export const REVIEW_RULES: Record<string, ReviewRule> = {
  "umunity.workflows.v1": {
    statusField: "status",
    chain: FOUR_STAGE,
    orgField: "orgName",
    ownerFields: ["operations"],
    ownerFieldsWhen: ["approved"],
    closeout: true,
  },
  "umunity.transitions.v1": {
    statusField: "status",
    chain: ["pending_adviser", "pending_admin1", "completed"],
    orgField: "orgName",
    reviewerFields: ["archivedOfficers"],
  },
  "umunity.org-compliance.v1": { statusField: "status", chain: FOUR_STAGE, orgField: "orgName" },
  "umunity.post-approvals.v1": {
    statusField: "status",
    chain: ["pending_adviser", "pending_admin2", "published"],
    orgField: "orgName",
  },
  "umunity.event-requirements.v1": {
    statusField: "reviewStatus",
    chain: FOUR_STAGE,
    orgField: "orgShort",
    // Leaders upload files and track checklist items at any stage; reviewers mark items during their stage.
    ownerFields: ["sections"],
    ownerFieldsWhen: ["draft", "pending_adviser", "revision_requested", "pending_admin2", "pending_admin1", "approved", "rejected"],
    reviewerFields: ["sections"],
  },
};

/** Statuses in which the owner may edit the item's content and (re)submit it. */
const EDITABLE = new Set(["draft", "revision_requested", "rejected"]);
/** Which role reviews each pending stage. */
const STAGE_REVIEWER: Record<string, Role> = {
  pending_adviser: "adviser",
  pending_admin2: "admin2",
  pending_admin1: "admin1",
};
/** Fields that only record activity; anyone allowed to touch the item may update them. */
const ACTIVITY_FIELDS = ["currentStage", "updatedAt", "comments", "history"];

/** "UM Computer Studies Society" -> "UMCSS", "UM Cultural Guild" -> "UMCG". */
export function orgShortFor(name: string | undefined) {
  if (!name) return "";
  const words = name.split(/\s+/).filter(Boolean);
  const [first, ...rest] = words;
  return first === "UM" ? `UM${rest.map((w) => w[0]).join("").toUpperCase()}` : words.map((w) => w[0]).join("").toUpperCase();
}

export type Actor = { role: Role; org?: string };

function ownsItem(actor: Actor, rule: ReviewRule, item: Item) {
  if (actor.role !== "leader" || !actor.org) return false;
  const value = item[rule.orgField];
  return rule.orgField === "orgName" ? value === actor.org : value === orgShortFor(actor.org);
}

/** The legacy "admin" account may act at any review stage. */
function reviews(actor: Actor, stage: string) {
  return actor.role === "admin" || STAGE_REVIEWER[stage] === actor.role;
}

function nextInChain(chain: readonly string[], stage: string) {
  const i = chain.indexOf(stage);
  return i >= 0 && i < chain.length - 1 ? chain[i + 1] : null;
}

function closeoutOf(item: Item): string | undefined {
  const ops = item.operations as { postEvent?: { closeoutStatus?: string } } | undefined;
  return ops?.postEvent?.closeoutStatus;
}

/** JSON of the item without the given top-level fields (and without the closeout status). */
function contentOf(item: Item, without: readonly string[]) {
  const copy: Item = { ...item };
  for (const f of without) delete copy[f];
  if (copy.operations && typeof copy.operations === "object") {
    const ops = { ...(copy.operations as Item) };
    if (ops.postEvent && typeof ops.postEvent === "object") {
      const pe = { ...(ops.postEvent as Item) };
      delete pe.closeoutStatus;
      ops.postEvent = pe;
    }
    copy.operations = ops;
  }
  return JSON.stringify(copy);
}

/** Existing comments/history entries can't change, and new ones must be signed with the actor's role. */
function checkAppendOnly(before: Item, after: Item, actor: Actor): string | null {
  for (const [field, roleKey] of [
    ["comments", "authorRole"],
    ["history", "byRole"],
  ] as const) {
    const old = Array.isArray(before[field]) ? (before[field] as Item[]) : [];
    const now = Array.isArray(after[field]) ? (after[field] as Item[]) : [];
    const nowById = new Map(now.map((e) => [String(e.id), JSON.stringify(e)]));
    for (const e of old) {
      if (nowById.get(String(e.id)) !== JSON.stringify(e)) return `Existing ${field} can't be edited or removed.`;
    }
    const oldIds = new Set(old.map((e) => String(e.id)));
    for (const e of now) {
      if (oldIds.has(String(e.id))) continue;
      const claimed = e[roleKey];
      const ok = claimed === actor.role || (actor.role === "admin" && (claimed === "admin1" || claimed === "admin2"));
      if (!ok) return `New ${field} must be signed with your own role.`;
    }
  }
  return null;
}

/**
 * Returns null if `actor` may change `before` into `after` (null = created / deleted),
 * otherwise a message explaining why not.
 */
export function checkReviewChange(rule: ReviewRule, actor: Actor, before: Item | null, after: Item | null): string | null {
  const isAdmin = actor.role === "admin" || actor.role === "admin1" || actor.role === "admin2";
  const sf = rule.statusField;

  if (!after) {
    if (!before) return null;
    if (isAdmin || ownsItem(actor, rule, before)) return null;
    return "Only the organization's leader or an admin can delete this.";
  }

  if (!before) {
    if (!ownsItem(actor, rule, after)) return "Only a leader can create this, and only for their own organization.";
    const s = String(after[sf]);
    if (s !== "draft" && s !== rule.chain[0]) return "New submissions start as a draft or go to adviser review.";
    return checkAppendOnly({}, after, actor);
  }

  if (String(before.id) !== String(after.id) || before[rule.orgField] !== after[rule.orgField]) {
    return "An item's id and organization can't change.";
  }
  const appendError = checkAppendOnly(before, after, actor);
  if (appendError) return appendError;

  const s0 = String(before[sf]);
  const s1 = String(after[sf]);
  const c0 = rule.closeout ? closeoutOf(before) : undefined;
  const c1 = rule.closeout ? closeoutOf(after) : undefined;
  const owner = ownsItem(actor, rule, before);
  const ownerExtra = rule.ownerFields && rule.ownerFieldsWhen?.includes(s0) ? rule.ownerFields : [];

  if (owner) {
    if (s0 !== s1) {
      const submit = EDITABLE.has(s0) && s1 === rule.chain[0];
      const retract = rule.chain.slice(0, -1).includes(s0) && s1 === "draft";
      const finish = rule.closeout && s0 === "approved" && s1 === "completed";
      if (!submit && !retract && !finish) return `A leader can't move this from ${s0} to ${s1}.`;
    }
    if (rule.closeout && c0 !== c1) {
      if (!(s0 === "approved" && EDITABLE.has(String(c0)) && c1 === "pending_adviser")) return "That closeout step isn't yours to take.";
    }
    const changedContent = contentOf(before, [sf, ...ACTIVITY_FIELDS, ...ownerExtra]) !== contentOf(after, [sf, ...ACTIVITY_FIELDS, ...ownerExtra]);
    if (changedContent && !EDITABLE.has(s0)) return "This can only be edited while it's a draft or returned for revision.";
    return null;
  }

  // Reviewers (and anyone else on staff, who may only comment).
  const reviewerOfStage = reviews(actor, s0);
  if (s0 !== s1) {
    const closeoutFinal = rule.closeout && s0 === "approved" && s1 === "completed" && c0 === "pending_admin1" && c1 === "approved" && reviews(actor, "pending_admin1");
    const allowed = reviewerOfStage && (s1 === nextInChain(rule.chain, s0) || s1 === "revision_requested" || s1 === "rejected");
    if (!allowed && !closeoutFinal) return `Your role can't move this from ${s0} to ${s1}.`;
  }
  if (rule.closeout && c0 !== c1) {
    const closeoutChain = ["pending_adviser", "pending_admin2", "pending_admin1", "approved"];
    const ok = c0 !== undefined && reviews(actor, c0) && (c1 === nextInChain(closeoutChain, c0) || c1 === "revision_requested" || c1 === "rejected");
    if (!ok) return "That closeout step isn't yours to take.";
  }
  // e.g. archiving outgoing officers on the final approval, or marking requirement items reviewed.
  const extra = reviewerOfStage ? (rule.reviewerFields ?? []) : [];
  if (contentOf(before, [sf, ...ACTIVITY_FIELDS, ...extra]) !== contentOf(after, [sf, ...ACTIVITY_FIELDS, ...extra])) {
    return "Reviewers can comment and decide, but not edit the submission itself.";
  }
  return null;
}
