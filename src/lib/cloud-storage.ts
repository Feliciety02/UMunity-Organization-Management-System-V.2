// Drop-in replacement for localStorage used by the app's data stores.
// The browser copy is only a cache: the database (via server functions) is the source of truth.
//  - syncFromServer() pulls every value for the signed-in user, then tells all stores to re-read.
//  - setItem() updates the cache at once and saves the change shortly after. Lists and objects
//    are saved item by item (only what changed), so concurrent edits to different items survive.
//  - Each saved item carries the version it was based on. If someone else saved the same item in
//    the meantime, or the server refuses the step (review rules), the latest version is shown instead.
import { toast } from "sonner";
import type { Role } from "@/lib/auth";
import { loadDataFn, patchDataFn, saveDataFn } from "@/lib/api.functions";
import {
  canWrite,
  diffEntries,
  isSyncedKey,
  SERVER_CACHE_KEYS,
  SYNCED_KEYS,
  toEntries,
  type BaseItem,
  type DocKind,
  type SyncedKey,
} from "@/lib/synced-keys";

const PUSH_DELAY_MS = 300;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];

type Base = { kind: DocKind; items: Map<string, BaseItem> } | null;

let synced = false;
let role: Role | null = null;
let syncing: Promise<void> | null = null;
const dirty = new Set<SyncedKey>(); // keys changed locally but not saved yet
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const bases = new Map<SyncedKey, Base>(); // last value the server confirmed, per key
const failures = new Map<SyncedKey, number>();
const rejected = new Set<SyncedKey>(); // edits the server refused; the next sync restores its copy
const refreshers = new Set<() => Promise<void>>();
let warned = false;

function local() {
  return typeof window === "undefined" ? null : window.localStorage;
}

/** The confirmed state of a stored value: positions and versions as the server reported them. */
function baseFrom(value: string, saved: Record<string, [number, number]>): Base {
  try {
    const split = toEntries(JSON.parse(value));
    if (!split) return null;
    const items = new Map<string, BaseItem>();
    split.entries.forEach(([k, v], i) => {
      const [pos, ver] = saved[k] ?? [(i + 1) * 1024, 1];
      items.set(k, { json: JSON.stringify(v), pos, ver });
    });
    return { kind: split.kind, items };
  } catch {
    return null;
  }
}

// Tabs of one browser share the local copy but each remembers its own confirmed versions.
// After a save, tell the other tabs what the server now holds, so their next save of the same
// list isn't based on versions that are already out of date (which would look like a conflict).
type BaseMessage = { key: SyncedKey; kind: DocKind; items: Array<[string, BaseItem]> } | { key: SyncedKey; kind: null };
const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("umunity-sync");
channel?.addEventListener("message", (e: MessageEvent<BaseMessage>) => {
  const msg = e.data;
  if (!msg || !isSyncedKey(msg.key)) return;
  bases.set(msg.key, msg.kind ? { kind: msg.kind, items: new Map(msg.items) } : null);
});

function shareBase(key: SyncedKey, base: Base) {
  try {
    channel?.postMessage(base ? { key, kind: base.kind, items: [...base.items] } : { key, kind: null });
  } catch {
    /* other tabs fall back to their next sync */
  }
}

function canPush(key: SyncedKey) {
  return role !== null && canWrite(key, role);
}

function notifySaveProblem() {
  if (warned) return;
  warned = true;
  toast.warning("Some changes aren't saved yet", {
    id: "umunity-save",
    description: "We'll keep retrying. Keep this tab open until they're saved.",
  });
}

function notifySaved() {
  if (!warned) return;
  warned = false;
  toast.success("All changes saved", { id: "umunity-save" });
}

/**
 * The server refused a save for good (someone else changed the same item, or this step isn't
 * allowed): drop the local edit and show what the database holds.
 */
function rejectEdit(key: SyncedKey, message: string, conflict: boolean) {
  rejected.add(key);
  dirty.delete(key);
  failures.delete(key);
  bases.delete(key);
  clearTimeout(timers.get(key));
  timers.delete(key);
  if (conflict) toast.info("Someone else changed this at the same time", { description: "Showing the latest version. Please redo your change if it's still needed." });
  else toast.error("That change wasn't saved", { description: message });
  if (failures.size === 0) notifySaved();
  void syncFromServer().catch(() => {});
}

async function push(key: SyncedKey) {
  timers.delete(key);
  const value = local()?.getItem(key);
  if (value == null || !canPush(key)) {
    dirty.delete(key);
    return;
  }
  try {
    const base = bases.get(key) ?? null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      dirty.delete(key);
      return;
    }
    const next = toEntries(parsed);
    const patch = base && next ? diffEntries(base, next) : null;
    let newBase: Base;
    if (patch) {
      const items = new Map(base!.items);
      if (patch.upserts.length || patch.deletes.length) {
        const res = await patchDataFn({ data: { key, patch } });
        if (!res.ok) {
          if (res.code === "reshape") {
            bases.delete(key); // stored whole on the server: send the whole value next time
            throw new Error(res.error);
          }
          return rejectEdit(key, res.error, res.code === "conflict");
        }
        // New base: the confirmed items with the positions just sent and the versions now stored.
        patch.deletes.forEach((d) => items.delete(d.k));
        patch.upserts.forEach((u) => items.set(u.k, { json: u.v, pos: u.pos, ver: res.versions[u.k] ?? u.ver + 1 }));
      }
      newBase = { kind: patch.kind, items };
    } else {
      const res = await saveDataFn({ data: { key, value } });
      if (!res.ok) return rejectEdit(key, res.error, res.code === "conflict");
      newBase = baseFrom(value, res.items);
    }
    bases.set(key, newBase);
    shareBase(key, newBase);
    failures.delete(key);
    // Only clear if nothing changed while the request was in flight.
    if (local()?.getItem(key) === value) dirty.delete(key);
    else schedulePush(key);
    if (failures.size === 0) notifySaved();
  } catch (err) {
    const n = (failures.get(key) ?? 0) + 1;
    failures.set(key, n);
    // Network trouble: keep the base and retry the same patch. Its versions stop it from
    // overwriting anything someone else saved in the meantime.
    console.warn(`[UMunity] Couldn't save ${key} (attempt ${n}); will retry.`, err);
    notifySaveProblem();
    const delay = RETRY_DELAYS_MS[Math.min(n - 1, RETRY_DELAYS_MS.length - 1)];
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => void push(key), delay));
  }
}

function schedulePush(key: SyncedKey) {
  dirty.add(key);
  if (!synced) return; // pushed once the first sync settles what the server already has
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => void push(key), PUSH_DELAY_MS));
}

export const cloudStorage = {
  getItem(key: string): string | null {
    try {
      return local()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      local()?.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); the push below still saves it.
    }
    if (isSyncedKey(key)) schedulePush(key);
  },
  removeItem(key: string) {
    try {
      local()?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/** Data with its own tables (e.g. memberships) registers a loader that runs on every sync. */
export function registerRefresher(fn: () => Promise<void>) {
  refreshers.add(fn);
}

/**
 * Pull the signed-in user's data from the database into the cache.
 * Server values win, except for keys with unsaved local edits; keys the server has
 * never seen (first sign-in) are uploaded from the local copy, which holds the seed data,
 * if this role may write them.
 */
export function syncFromServer(forRole?: Role): Promise<void> {
  if (forRole) role = forRole;
  if (syncing) return syncing;
  syncing = (async () => {
    const store = local();
    if (!store) return;
    const firstSync = !synced;
    const [remote] = await Promise.all([
      loadDataFn(),
      ...[...refreshers].map((fn) => fn().catch((err) => console.warn("[UMunity] Couldn't refresh data.", err))),
    ]);
    for (const key of Object.keys(SYNCED_KEYS) as SyncedKey[]) {
      const doc = remote[key];
      if (doc && (firstSync || !dirty.has(key))) {
        store.setItem(key, doc.value);
        // Only item-stored values can be patched; a value stored whole (e.g. by an older
        // version) gets no base, so its next save is whole and converts it to item rows.
        const saved = Object.fromEntries(
          Object.entries(doc.positions ?? {}).map(([k, pos]) => [k, [pos, doc.versions?.[k] ?? 1] as [number, number]]),
        );
        bases.set(key, doc.kind ? baseFrom(doc.value, saved) : null);
        dirty.delete(key);
      } else if (!doc) {
        bases.delete(key);
        // A refused edit to a value the server doesn't have: drop it rather than re-sending it.
        if (rejected.has(key)) store.removeItem(key);
        if (store.getItem(key) != null && canPush(key) && !rejected.has(key)) dirty.add(key);
        else dirty.delete(key);
      }
    }
    synced = true;
    rejected.clear();
    for (const key of [...dirty]) void push(key);
    // Every store listens for "storage" and re-reads, so the UI picks up the fresh data.
    window.dispatchEvent(new Event("storage"));
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}

/** Forget the cached data (on sign-in/out) so one account never sees or uploads another's. */
export function clearSyncedCache() {
  synced = false;
  role = null;
  dirty.clear();
  bases.clear();
  failures.clear();
  rejected.clear();
  timers.forEach(clearTimeout);
  timers.clear();
  const store = local();
  if (!store) return;
  for (const key of [...Object.keys(SYNCED_KEYS), ...SERVER_CACHE_KEYS]) store.removeItem(key);
  window.dispatchEvent(new Event("storage"));
}

/** Save anything pending right away (before sign-out). */
export async function flushPending() {
  if (!synced) return;
  timers.forEach(clearTimeout);
  timers.clear();
  await Promise.all([...dirty].map((key) => push(key)));
}

/** Keep other people's changes flowing in: re-sync when the tab regains focus; warn before losing edits. */
export function startBackgroundSync() {
  if (typeof window === "undefined") return () => {};
  const onFocus = () => {
    if (!synced || document.visibilityState !== "visible") return;
    void syncFromServer().catch(() => {});
  };
  const onUnload = (e: BeforeUnloadEvent) => {
    if (synced && dirty.size > 0) {
      void flushPending();
      e.preventDefault();
    }
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onFocus);
  window.addEventListener("beforeunload", onUnload);
  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onFocus);
    window.removeEventListener("beforeunload", onUnload);
  };
}
