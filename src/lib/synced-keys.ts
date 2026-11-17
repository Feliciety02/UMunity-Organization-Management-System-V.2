// Every piece of app state that lives in the database, who it belongs to, and who may change it.
// "user": each account has its own copy (bookmarks, RSVPs, inbox...); only that account writes it.
// "shared": one copy for everyone (review queues, org records, workflows...); only the listed
// roles may write it. The server rejects any key not listed here.
import type { Role } from "@/lib/auth";

const ALL: readonly Role[] = ["student", "leader", "adviser", "admin2", "admin1", "admin"];
const STAFF: readonly Role[] = ["leader", "adviser", "admin2", "admin1", "admin"];
const ADMINS: readonly Role[] = ["admin2", "admin1", "admin"];

type KeyRule = { scope: "user" } | { scope: "shared"; writers: readonly Role[] };

export const SYNCED_KEYS = {
  // Per-user
  "umunity.saved.v1": { scope: "user" },
  "umunity.messages.v1": { scope: "user" },
  "umunity.rsvps.v1": { scope: "user" },
  "umunity.student-prefs.v1": { scope: "user" },
  "umunity.staff-profiles.v1": { scope: "user" },
  // Shared across the whole campus.
  // Notifications are written by one role for another (e.g. an admin approval notifies the
  // leader) and each list is already filtered by role, so every role may add to them.
  "umunity.notifications.v2": { scope: "shared", writers: ALL },
  "umunity.admin.pending-orgs.v1": { scope: "shared", writers: ADMINS },
  "umunity.admin.event-decisions.v1": { scope: "shared", writers: ADMINS },
  "umunity.event-requirements.v1": { scope: "shared", writers: STAFF },
  "umunity.org-compliance.v1": { scope: "shared", writers: STAFF },
  "umunity.org-registry.v1": { scope: "shared", writers: STAFF },
  "umunity.post-approvals.v1": { scope: "shared", writers: STAFF },
  "umunity.workflows.v1": { scope: "shared", writers: STAFF },
  "umunity.transitions.v1": { scope: "shared", writers: STAFF },
  "umunity.leader-org-profile.v1": { scope: "shared", writers: ["leader", ...ADMINS] },
} as const satisfies Record<string, KeyRule>;

export type SyncedKey = keyof typeof SYNCED_KEYS;

/** Browser caches of data that has its own tables (memberships); cleared on sign-in/out. */
export const SERVER_CACHE_KEYS = ["umunity.memberships.v1", "umunity.membership-requests.v1"] as const;

export function isSyncedKey(key: string): key is SyncedKey {
  return Object.prototype.hasOwnProperty.call(SYNCED_KEYS, key);
}

export function scopeOf(key: SyncedKey): "user" | "shared" {
  return SYNCED_KEYS[key].scope;
}

export function canWrite(key: SyncedKey, role: Role): boolean {
  const rule: KeyRule = SYNCED_KEYS[key];
  return rule.scope === "user" || rule.writers.includes(role);
}

/** Largest JSON value the server accepts for one key (the workflow store is the biggest). */
export const MAX_VALUE_BYTES = 1_000_000;

// ---------- Item-level storage ----------
// Lists whose items have a stable identity, and plain objects, are stored one row per item,
// so two people editing different items of the same store don't overwrite each other.

export type DocKind = "array" | "object";

/** The identity of a list item: its id, slug, or event title. */
export function itemKeyOf(item: unknown): string | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const rec = item as Record<string, unknown>;
  const id = rec.id ?? rec.slug ?? rec.eventTitle;
  return typeof id === "string" && id ? id : null;
}

export type DocEntries = { kind: DocKind; entries: Array<[string, unknown]> };

/** Split a value into identified entries, or null if it must be stored whole. */
export function toEntries(value: unknown): DocEntries | null {
  if (Array.isArray(value)) {
    const seen = new Set<string>();
    const entries: Array<[string, unknown]> = [];
    for (const item of value) {
      const k = itemKeyOf(item);
      if (k === null || seen.has(k)) return null;
      seen.add(k);
      entries.push([k, item]);
    }
    return { kind: "array", entries };
  }
  if (value && typeof value === "object") return { kind: "object", entries: Object.entries(value) };
  return null;
}

/** One row-level change set for a store. Positions order array items (fractional, ascending). */
export type DocPatch = {
  kind: DocKind;
  upserts: Array<{ k: string; v: string; pos: number }>;
  deletes: string[];
};

const GAP = 1024;

/**
 * Work out the row changes from the last value the server confirmed (`base`) to `next`.
 * Returns null when the shapes don't allow a row-level patch (send the whole value instead).
 */
export function diffEntries(
  base: { kind: DocKind; items: Map<string, { json: string; pos: number }> },
  next: DocEntries,
): DocPatch | null {
  if (base.kind !== next.kind) return null;
  const upserts: DocPatch["upserts"] = [];
  const nextKeys = new Set(next.entries.map(([k]) => k));
  const deletes = [...base.items.keys()].filter((k) => !nextKeys.has(k));

  if (next.kind === "object") {
    for (const [k, v] of next.entries) {
      const json = JSON.stringify(v);
      if (base.items.get(k)?.json !== json) upserts.push({ k, v: json, pos: 0 });
    }
    return { kind: "object", upserts, deletes };
  }

  // Arrays: keep existing items' positions unless their relative order changed.
  const known = next.entries.filter(([k]) => base.items.has(k)).map(([k]) => base.items.get(k)!.pos);
  const ordered = known.every((p, i) => i === 0 || p > known[i - 1]);
  if (!ordered) {
    next.entries.forEach(([k, v], i) => upserts.push({ k, v: JSON.stringify(v), pos: (i + 1) * GAP }));
    return { kind: "array", upserts, deletes: [...deletes] };
  }
  const positions = next.entries.map(([k]) => base.items.get(k)?.pos ?? null);
  next.entries.forEach(([k, v], i) => {
    const json = JSON.stringify(v);
    let pos = positions[i];
    if (pos === null) {
      // New item: place it between its neighbours that already have positions.
      let prev: number | null = null;
      for (let j = i - 1; j >= 0 && prev === null; j--) prev = positions[j];
      let after: number | null = null;
      for (let j = i + 1; j < positions.length && after === null; j++) after = positions[j];
      pos = prev === null && after === null ? (i + 1) * GAP : prev === null ? after! - GAP : after === null ? prev + GAP : (prev + after) / 2;
      positions[i] = pos;
      upserts.push({ k, v: json, pos });
    } else if (base.items.get(k)!.json !== json) {
      upserts.push({ k, v: json, pos });
    }
  });
  return { kind: "array", upserts, deletes };
}
