// Server-only business logic. Every function takes the database client, so the same code runs
// behind the server functions (api.functions.ts) and in the tests (against an in-memory database).
import type { Client, InStatement, Transaction } from "@libsql/client";
import type { Session } from "@/lib/demo-users";
import { organizations } from "@/data/orgs";
import { DISABLED, hashPassword, randomToken, rowToUser, sha256Hex, toSession, verifyPassword, type UserRow } from "@/lib/db.server";
import {
  canWrite,
  isSyncedKey,
  MAX_VALUE_BYTES,
  scopeOf,
  SYNCED_KEYS,
  toEntries,
  type DocKind,
  type DocPatch,
  type SyncedKey,
} from "@/lib/synced-keys";
import { checkReviewChange, REVIEW_RULES } from "@/lib/review-rules";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
export const UM_EMAIL = /^[^\s@]+@(umindanao\.edu\.ph|um\.edu\.ph)$/i;

/** Thrown for problems the user should see (bad input, not allowed...). */
export class UserError extends Error {}

const normEmail = (email: string) => String(email ?? "").trim().toLowerCase();

async function userByEmail(c: Client, email: string) {
  const res = await c.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [normEmail(email)] });
  return res.rows[0] ? rowToUser(res.rows[0] as Record<string, unknown>) : null;
}

async function userById(c: Client, id: string) {
  const res = await c.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [id] });
  return res.rows[0] ? rowToUser(res.rows[0] as Record<string, unknown>) : null;
}

// ---------- Sign-in throttle ----------

export const THROTTLE = {
  windowMs: 15 * MINUTE,
  lockMs: 15 * MINUTE,
  maxPerEmail: 5,
  maxPerIp: 20,
};

async function lockedUntil(c: Client, keys: string[], now: number) {
  const res = await c.execute({
    sql: `SELECT MAX(locked_until) AS until FROM login_attempts WHERE key IN (${keys.map(() => "?").join(",")})`,
    args: keys,
  });
  const until = Number(res.rows[0]?.until ?? 0);
  return until > now ? until : 0;
}

async function recordFailure(c: Client, key: string, max: number, now: number) {
  const res = await c.execute({ sql: "SELECT failures, window_start FROM login_attempts WHERE key = ?", args: [key] });
  const row = res.rows[0];
  const fresh = !row || now - Number(row.window_start) > THROTTLE.windowMs;
  const failures = fresh ? 1 : Number(row.failures) + 1;
  const windowStart = fresh ? now : Number(row.window_start);
  const locked = failures >= max ? now + THROTTLE.lockMs : 0;
  await c.execute({
    sql: `INSERT INTO login_attempts (key, failures, window_start, locked_until) VALUES (?, ?, ?, ?)
          ON CONFLICT (key) DO UPDATE SET failures = excluded.failures, window_start = excluded.window_start, locked_until = excluded.locked_until`,
    args: [key, failures, windowStart, locked],
  });
}

export type AuthResult = { ok: true; user: UserRow } | { ok: false; reason: "invalid" } | { ok: false; reason: "locked"; retryAfterMs: number };

/** Check a password, with lockouts after repeated failures per email and per IP. */
export async function authenticate(c: Client, email: string, password: string, ip: string, now = Date.now()): Promise<AuthResult> {
  const emailKey = `email:${normEmail(email)}`;
  const ipKey = `ip:${ip || "unknown"}`;
  const until = await lockedUntil(c, [emailKey, ipKey], now);
  if (until) return { ok: false, reason: "locked", retryAfterMs: until - now };

  const user = await userByEmail(c, email);
  // Hash even when the account doesn't exist, so timing doesn't reveal which emails are registered.
  const valid = user && user.passwordHash !== DISABLED ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
  if (!valid || !user) {
    await recordFailure(c, emailKey, THROTTLE.maxPerEmail, now);
    await recordFailure(c, ipKey, THROTTLE.maxPerIp, now);
    return { ok: false, reason: "invalid" };
  }
  await c.execute({ sql: "DELETE FROM login_attempts WHERE key = ?", args: [emailKey] });
  return { ok: true, user };
}

// ---------- Sessions ----------

/** Creates a session and returns the raw token (only its hash is stored). Also prunes expired rows. */
export async function createSession(c: Client, userId: string, remember: boolean, now = Date.now()) {
  const token = randomToken();
  const ttl = remember ? 30 * DAY : DAY;
  await c.batch(
    [
      { sql: "DELETE FROM sessions WHERE expires_at <= ?", args: [now] },
      { sql: "DELETE FROM password_resets WHERE expires_at <= ? OR used_at IS NOT NULL", args: [now] },
      { sql: "DELETE FROM login_attempts WHERE locked_until < ? AND window_start < ?", args: [now, now - THROTTLE.windowMs] },
      { sql: "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", args: [await sha256Hex(token), userId, now + ttl, now] },
    ],
    "write",
  );
  return { token, ttl };
}

export async function userForToken(c: Client, token: string | undefined, now = Date.now()) {
  if (!token) return null;
  const res = await c.execute({
    sql: `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?`,
    args: [await sha256Hex(token), now],
  });
  return res.rows[0] ? rowToUser(res.rows[0] as Record<string, unknown>) : null;
}

export async function endSession(c: Client, token: string) {
  await c.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [await sha256Hex(token)] });
}

// ---------- Accounts ----------

export type RegisterInput = { name: string; email: string; program: string; password: string };

export async function registerStudent(c: Client, input: RegisterInput) {
  const name = String(input.name ?? "").trim();
  const email = normEmail(input.email);
  const program = String(input.program ?? "").trim();
  const password = String(input.password ?? "");
  if (name.length < 2 || !program || password.length < 8 || !UM_EMAIL.test(email)) {
    return { ok: false as const, field: "form" as const, error: "Check the highlighted fields and try again." };
  }
  if (await userByEmail(c, email)) {
    return { ok: false as const, field: "email" as const, error: "An account with this email already exists. Sign in instead." };
  }
  const id = crypto.randomUUID();
  const avatarColor = "from-rose-400 to-primary";
  await c.execute({
    sql: `INSERT INTO users (id, email, name, role, program, org, avatar_color, password_hash, created_at)
          VALUES (?, ?, ?, 'student', ?, NULL, ?, ?, ?)`,
    args: [id, email, name, program, avatarColor, await hashPassword(password), Date.now()],
  });
  const user = (await userById(c, id))!;
  return { ok: true as const, user };
}

async function requirePassword(user: UserRow, password: string) {
  if (user.passwordHash === DISABLED || !(await verifyPassword(String(password ?? ""), user.passwordHash))) {
    throw new UserError("Your current password is incorrect.");
  }
}

/** Changes the password and signs out every other session. */
export async function changePassword(c: Client, user: UserRow, current: string, next: string, keepToken?: string) {
  await requirePassword(user, current);
  if (String(next ?? "").length < 8) throw new UserError("Use at least 8 characters for the new password.");
  const keep = keepToken ? await sha256Hex(keepToken) : "";
  await c.batch(
    [
      { sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [await hashPassword(next), user.id] },
      { sql: "DELETE FROM sessions WHERE user_id = ? AND id != ?", args: [user.id, keep] },
    ],
    "write",
  );
}

export async function changeEmail(c: Client, user: UserRow, password: string, newEmail: string): Promise<Session> {
  await requirePassword(user, password);
  const email = normEmail(newEmail);
  if (!UM_EMAIL.test(email)) throw new UserError("Use your UM email (@umindanao.edu.ph).");
  if (email === user.email) return toSession(user);
  if (await userByEmail(c, email)) throw new UserError("Another account already uses that email.");
  await c.execute({ sql: "UPDATE users SET email = ? WHERE id = ?", args: [email, user.id] });
  return toSession({ ...user, email });
}

/** Deletes the account and everything that belongs only to it. */
export async function deleteAccount(c: Client, user: UserRow, password: string) {
  await requirePassword(user, password);
  await c.batch(
    [
      { sql: "DELETE FROM sessions WHERE user_id = ?", args: [user.id] },
      { sql: "DELETE FROM password_resets WHERE user_id = ?", args: [user.id] },
      { sql: "DELETE FROM app_data WHERE scope = ?", args: [`user:${user.id}`] },
      { sql: "DELETE FROM app_items WHERE scope = ?", args: [`user:${user.id}`] },
      { sql: "DELETE FROM org_members WHERE user_id = ?", args: [user.id] },
      { sql: "DELETE FROM membership_requests WHERE user_id = ? AND status = 'pending'", args: [user.id] },
      { sql: "DELETE FROM login_attempts WHERE key = ?", args: [`email:${user.email}`] },
      { sql: "DELETE FROM users WHERE id = ?", args: [user.id] },
    ],
    "write",
  );
}

// ---------- Password reset ----------

export const RESET_TTL_MS = 30 * MINUTE;

/** Returns a one-time token for the account, or null if no such account (callers must not reveal which). */
export async function createPasswordReset(c: Client, email: string, now = Date.now()) {
  const user = await userByEmail(c, email);
  if (!user || user.passwordHash === DISABLED) return null;
  const token = randomToken();
  await c.batch(
    [
      { sql: "DELETE FROM password_resets WHERE user_id = ?", args: [user.id] },
      { sql: "INSERT INTO password_resets (id, user_id, expires_at) VALUES (?, ?, ?)", args: [await sha256Hex(token), user.id, now + RESET_TTL_MS] },
    ],
    "write",
  );
  return { token, user };
}

export async function resetPassword(c: Client, token: string, password: string, now = Date.now()) {
  if (String(password ?? "").length < 8) throw new UserError("Use at least 8 characters for the new password.");
  const id = await sha256Hex(String(token ?? ""));
  const res = await c.execute({ sql: "SELECT user_id FROM password_resets WHERE id = ? AND used_at IS NULL AND expires_at > ?", args: [id, now] });
  const userId = res.rows[0]?.user_id;
  if (userId == null) throw new UserError("This reset link is invalid or has expired. Request a new one.");
  await c.batch(
    [
      { sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [await hashPassword(password), String(userId)] },
      { sql: "UPDATE password_resets SET used_at = ? WHERE id = ?", args: [now, id] },
      { sql: "DELETE FROM sessions WHERE user_id = ?", args: [String(userId)] },
      // Proving control of the inbox lifts a sign-in lockout on this account.
      { sql: "DELETE FROM login_attempts WHERE key = (SELECT 'email:' || email FROM users WHERE id = ?)", args: [String(userId)] },
    ],
    "write",
  );
}

// ---------- App data ----------

/** Someone else saved the same item after this client last loaded it. */
export class ConflictError extends UserError {}
/** The store is still saved whole (older format): the client should re-send the whole value. */
export class ReshapeError extends UserError {}

const scopeFor = (key: SyncedKey, userId: string) => (scopeOf(key) === "user" ? `user:${userId}` : "shared");

export type LoadedDoc = {
  value: string;
  kind?: DocKind;
  positions?: Record<string, number>;
  versions?: Record<string, number>;
};
/** Where each saved item now sits and which version it is: [position, version]. */
export type SavedItems = Record<string, [number, number]>;
export type StoreSeeds = Partial<Record<SyncedKey, () => unknown>>;

/**
 * Shared stores with starting data are filled on the server the first time anyone loads them,
 * so browsers never upload "already approved" items (which the review rules would refuse).
 * Pass seeds that return [] to start empty (production).
 */
async function seedStores(c: Client, seeds: StoreSeeds, now: number) {
  const keys = (Object.keys(seeds) as SyncedKey[]).filter((k) => scopeOf(k) === "shared");
  if (!keys.length) return;
  const marks = keys.map(() => "?").join(", ");
  const present = await c.execute({
    sql: `SELECT key FROM app_items WHERE scope = 'shared' AND key IN (${marks})
          UNION SELECT key FROM app_data WHERE scope = 'shared' AND key IN (${marks})`,
    args: [...keys, ...keys],
  });
  const have = new Set(present.rows.map((r) => String(r.key)));
  const stmts: InStatement[] = [];
  for (const key of keys) {
    if (have.has(key)) continue;
    const value = seeds[key]!();
    const split = toEntries(value);
    if (split && split.entries.length) {
      split.entries.forEach(([itemKey, item], i) =>
        stmts.push({
          sql: `INSERT OR IGNORE INTO app_items (scope, key, item_key, kind, position, value, updated_at, updated_by, version)
                VALUES ('shared', ?, ?, ?, ?, ?, ?, NULL, 1)`,
          args: [key, itemKey, split.kind, (i + 1) * 1024, JSON.stringify(item), now],
        }),
      );
    } else {
      // Mark the store as existing-but-empty so no browser fills it with its own copy.
      stmts.push({
        sql: "INSERT OR IGNORE INTO app_data (scope, key, value, updated_at, updated_by) VALUES ('shared', ?, ?, ?, NULL)",
        args: [key, JSON.stringify(value ?? []), now],
      });
    }
  }
  if (stmts.length) await c.batch(stmts, "write");
}

/** Every synced value for the user: their own keys plus the shared ones, with item positions and versions. */
export async function loadData(c: Client, user: UserRow, seeds: StoreSeeds = {}, now = Date.now()): Promise<Record<string, LoadedDoc>> {
  await seedStores(c, seeds, now);
  const scopes = [`user:${user.id}`, "shared"];
  const [whole, items] = await Promise.all([
    c.execute({ sql: "SELECT scope, key, value FROM app_data WHERE scope IN (?, ?)", args: scopes }),
    c.execute({
      sql: "SELECT scope, key, item_key, kind, position, value, version FROM app_items WHERE scope IN (?, ?) ORDER BY key, position, updated_at",
      args: scopes,
    }),
  ]);
  const out: Record<string, LoadedDoc> = {};
  for (const row of whole.rows) {
    const key = String(row.key);
    if (isSyncedKey(key) && String(row.scope) === scopeFor(key, user.id)) out[key] = { value: String(row.value) };
  }
  const grouped = new Map<string, { kind: DocKind; rows: Array<{ k: string; v: string; pos: number; ver: number }> }>();
  for (const row of items.rows) {
    const key = String(row.key);
    if (!isSyncedKey(key) || String(row.scope) !== scopeFor(key, user.id)) continue;
    const g = grouped.get(key) ?? { kind: String(row.kind) as DocKind, rows: [] };
    g.rows.push({ k: String(row.item_key), v: String(row.value), pos: Number(row.position), ver: Number(row.version ?? 1) });
    grouped.set(key, g);
  }
  for (const [key, g] of grouped) {
    const value =
      g.kind === "array" ? `[${g.rows.map((r) => r.v).join(",")}]` : `{${g.rows.map((r) => `${JSON.stringify(r.k)}:${r.v}`).join(",")}}`;
    out[key] = {
      value,
      kind: g.kind,
      positions: Object.fromEntries(g.rows.map((r) => [r.k, r.pos])),
      versions: Object.fromEntries(g.rows.map((r) => [r.k, r.ver])),
    };
  }
  return out;
}

function checkWrite(user: UserRow, key: string): SyncedKey {
  if (!isSyncedKey(key)) throw new UserError(`Unknown data key: ${key}`);
  if (!canWrite(key, user.role)) throw new UserError("Your role can't change this data.");
  return key;
}

type Stored = { value: string; ver: number; pos: number };

async function storedItems(tx: Transaction, scope: string, key: SyncedKey, only?: string[]) {
  const out = new Map<string, Stored>();
  if (only && !only.length) return out;
  const filter = only ? ` AND item_key IN (${only.map(() => "?").join(", ")})` : "";
  const res = await tx.execute({
    sql: `SELECT item_key, value, version, position FROM app_items WHERE scope = ? AND key = ?${filter}`,
    args: [scope, key, ...(only ?? [])],
  });
  for (const r of res.rows) out.set(String(r.item_key), { value: String(r.value), ver: Number(r.version ?? 1), pos: Number(r.position) });
  return out;
}

const asItem = (json: string | undefined | null) => {
  if (json == null) return null;
  const v: unknown = JSON.parse(json);
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new UserError("Each item must be an object.");
  return v as Record<string, unknown>;
};

/** Apply the review rules (who may take which step) to one item's change. */
function checkReview(key: SyncedKey, user: UserRow, before: string | null, after: string | null) {
  const rule = REVIEW_RULES[key];
  if (!rule || before === after) return;
  const problem = checkReviewChange(rule, { role: user.role, org: user.org }, asItem(before), asItem(after));
  if (problem) throw new UserError(problem);
}

const upsertSql = `INSERT INTO app_items (scope, key, item_key, kind, position, value, updated_at, updated_by, version)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (scope, key, item_key) DO UPDATE SET kind = excluded.kind, position = excluded.position, value = excluded.value,
    updated_at = excluded.updated_at, updated_by = excluded.updated_by, version = excluded.version`;

/**
 * An emptied store keeps an explicit "[]" / "{}" row, so it still reads as existing and no
 * browser refills it with its own starting copy. The next patch removes the placeholder.
 */
function emptyPlaceholder(scope: string, key: SyncedKey, kind: DocKind, now: number, by: string): InStatement {
  return {
    sql: "INSERT OR REPLACE INTO app_data (scope, key, value, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)",
    args: [scope, key, kind === "array" ? "[]" : "{}", now, by],
  };
}

async function inTransaction<T>(c: Client, fn: (tx: Transaction) => Promise<T>): Promise<T> {
  const tx = await c.transaction("write");
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } finally {
    tx.close();
  }
}

/**
 * Replace a whole value. Lists of identified items and objects are stored one row per item.
 * Unchanged items keep their version; approval stores are checked item by item.
 */
export async function saveWhole(c: Client, user: UserRow, key: string, value: string, now = Date.now()): Promise<{ items: SavedItems }> {
  const k = checkWrite(user, key);
  if (typeof value !== "string" || value.length > MAX_VALUE_BYTES) throw new UserError("Value too large");
  const parsed: unknown = JSON.parse(value);
  const scope = scopeFor(k, user.id);
  const split = toEntries(parsed);
  if (REVIEW_RULES[k] && split?.kind !== "array") throw new UserError("Every item in this list needs an id.");

  return inTransaction(c, async (tx) => {
    const current = await storedItems(tx, scope, k);
    // A store still saved whole counts as its items for the review checks.
    const old = await tx.execute({ sql: "SELECT value FROM app_data WHERE scope = ? AND key = ?", args: [scope, k] });
    const before = new Map<string, string>([...current].map(([ik, s]) => [ik, s.value]));
    if (old.rows.length) {
      const legacy = toEntries(JSON.parse(String(old.rows[0].value)));
      legacy?.entries.forEach(([ik, item]) => before.set(ik, JSON.stringify(item)));
    }

    const stmts: InStatement[] = [
      { sql: "DELETE FROM app_items WHERE scope = ? AND key = ?", args: [scope, k] },
      { sql: "DELETE FROM app_data WHERE scope = ? AND key = ?", args: [scope, k] },
    ];
    const items: SavedItems = {};
    if (split && !split.entries.length) {
      stmts.push(emptyPlaceholder(scope, k, split.kind, now, user.id));
    } else if (split) {
      const nextKeys = new Set(split.entries.map(([ik]) => ik));
      for (const [ik, json] of before) if (!nextKeys.has(ik)) checkReview(k, user, json, null);
      split.entries.forEach(([ik, item], i) => {
        const json = JSON.stringify(item);
        checkReview(k, user, before.get(ik) ?? null, json);
        const prev = current.get(ik);
        const ver = prev && prev.value === json ? prev.ver : (prev?.ver ?? 0) + 1;
        const pos = (i + 1) * 1024;
        items[ik] = [pos, ver];
        stmts.push({ sql: upsertSql, args: [scope, k, ik, split.kind, pos, json, now, user.id, ver] });
      });
    } else {
      stmts.push({ sql: "INSERT INTO app_data (scope, key, value, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)", args: [scope, k, value, now, user.id] });
    }
    await tx.batch(stmts);
    return { items };
  });
}

/**
 * Apply item-level changes: only the items that changed are written, all or nothing.
 * Each change names the version it was based on; if any item moved on since, the whole patch is
 * refused with a ConflictError so the client can show the latest version instead of overwriting it.
 */
export async function patchData(c: Client, user: UserRow, key: string, patch: DocPatch, now = Date.now()): Promise<{ versions: Record<string, number> }> {
  const k = checkWrite(user, key);
  if (patch.kind !== "array" && patch.kind !== "object") throw new UserError("Bad patch");
  const size = patch.upserts.reduce((n, u) => n + String(u.v).length, 0);
  if (size > MAX_VALUE_BYTES) throw new UserError("Value too large");
  const scope = scopeFor(k, user.id);

  return inTransaction(c, async (tx) => {
    // A patch only makes sense on top of item rows. A store still saved whole (e.g. by an older
    // version) must be re-sent whole, unless it's just an empty placeholder.
    const whole = await tx.execute({ sql: "SELECT value FROM app_data WHERE scope = ? AND key = ?", args: [scope, k] });
    const stmts: InStatement[] = [];
    if (whole.rows.length) {
      const v = String(whole.rows[0].value);
      if (v !== "[]" && v !== "{}") throw new ReshapeError("This data changed shape on the server. Saving it again in full.");
      stmts.push({ sql: "DELETE FROM app_data WHERE scope = ? AND key = ?", args: [scope, k] });
    }
    const touched = [...new Set([...patch.upserts.map((u) => String(u.k)), ...patch.deletes.map((d) => String(d.k))])];
    const current = await storedItems(tx, scope, k, touched);
    const conflict = () => new ConflictError("Someone else changed this at the same time. Showing the latest version.");
    const versions: Record<string, number> = {};

    for (const u of patch.upserts) {
      const ik = String(u.k);
      const v = String(u.v);
      JSON.parse(v); // must be valid JSON
      const cur = current.get(ik);
      if ((cur?.ver ?? 0) !== Number(u.ver)) throw conflict();
      checkReview(k, user, cur?.value ?? null, v);
      const ver = cur && cur.value === v ? cur.ver : (cur?.ver ?? 0) + 1; // a pure move keeps the version
      versions[ik] = ver;
      stmts.push({ sql: upsertSql, args: [scope, k, ik, patch.kind, Number(u.pos) || 0, v, now, user.id, ver] });
    }
    for (const d of patch.deletes) {
      const ik = String(d.k);
      const cur = current.get(ik);
      if (!cur) continue; // already gone
      if (cur.ver !== Number(d.ver)) throw conflict();
      checkReview(k, user, cur.value, null);
      stmts.push({ sql: "DELETE FROM app_items WHERE scope = ? AND key = ? AND item_key = ?", args: [scope, k, ik] });
    }
    if (stmts.length) await tx.batch(stmts);
    const left = await tx.execute({ sql: "SELECT 1 FROM app_items WHERE scope = ? AND key = ? LIMIT 1", args: [scope, k] });
    if (!left.rows.length) await tx.execute(emptyPlaceholder(scope, k, patch.kind, now, user.id));
    return { versions };
  });
}

// ---------- Memberships ----------

export type MembershipState = { member: Record<string, string>; pending: Record<string, string> };
export type OrgRequest = { id: string; name: string; program: string; reason: string; createdAt: number };
export type MemberStatus = "Active" | "Inactive";
export type OrgMember = { name: string; email: string; program: string; since: string; title: string; status: MemberStatus; avatarColor: string };

const monthLabel = (ms: number) => new Date(ms).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Manila" });

function orgExists(slug: string) {
  return organizations.some((o) => o.slug === slug);
}

/** The org a leader manages (from their profile's org name). Admins may manage any org. */
function managedOrg(user: UserRow): string | null {
  if (user.role !== "leader") return null;
  return organizations.find((o) => o.name === user.org)?.slug ?? null;
}

function canManage(user: UserRow, slug: string) {
  return ["admin", "admin1", "admin2"].includes(user.role) || managedOrg(user) === slug;
}

export async function myMemberships(c: Client, user: UserRow): Promise<MembershipState> {
  const [members, pending] = await Promise.all([
    c.execute({ sql: "SELECT org_slug, since FROM org_members WHERE user_id = ?", args: [user.id] }),
    c.execute({ sql: "SELECT org_slug, created_at FROM membership_requests WHERE user_id = ? AND status = 'pending'", args: [user.id] }),
  ]);
  return {
    member: Object.fromEntries(members.rows.map((r) => [String(r.org_slug), String(r.since)])),
    pending: Object.fromEntries(pending.rows.map((r) => [String(r.org_slug), monthLabel(Number(r.created_at))])),
  };
}

export async function requestMembership(c: Client, user: UserRow, slug: string, reason = "", now = Date.now()) {
  if (user.role !== "student") throw new UserError("Only student accounts can request to join organizations.");
  if (!orgExists(slug)) throw new UserError("That organization doesn't exist.");
  const state = await myMemberships(c, user);
  if (state.member[slug] || state.pending[slug]) return;
  await c.execute({
    sql: `INSERT INTO membership_requests (id, org_slug, user_id, name, program, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    args: [crypto.randomUUID(), slug, user.id, user.name, user.program ?? "", String(reason ?? "").slice(0, 500), now],
  });
}

export async function cancelMembershipRequest(c: Client, user: UserRow, slug: string) {
  await c.execute({ sql: "DELETE FROM membership_requests WHERE user_id = ? AND org_slug = ? AND status = 'pending'", args: [user.id, slug] });
}

export async function leaveOrganization(c: Client, user: UserRow, slug: string) {
  await c.execute({ sql: "DELETE FROM org_members WHERE user_id = ? AND org_slug = ?", args: [user.id, slug] });
}

/** Pending requests for the leader's org (or, for admins, a given org). */
export async function orgRequests(c: Client, user: UserRow, slug?: string): Promise<OrgRequest[]> {
  const org = slug ?? managedOrg(user);
  if (!org || !canManage(user, org)) return [];
  const res = await c.execute({
    sql: "SELECT id, name, program, reason, created_at FROM membership_requests WHERE org_slug = ? AND status = 'pending' ORDER BY created_at DESC",
    args: [org],
  });
  return res.rows.map((r) => ({ id: String(r.id), name: String(r.name), program: String(r.program), reason: String(r.reason), createdAt: Number(r.created_at) }));
}

export async function resolveMembershipRequest(c: Client, user: UserRow, id: string, approve: boolean, now = Date.now()) {
  const res = await c.execute({ sql: "SELECT org_slug, user_id FROM membership_requests WHERE id = ? AND status = 'pending'", args: [id] });
  const row = res.rows[0];
  if (!row) throw new UserError("That request was already handled.");
  const slug = String(row.org_slug);
  if (!canManage(user, slug)) throw new UserError("You can only manage requests for your own organization.");
  const stmts: InStatement[] = [
    { sql: "UPDATE membership_requests SET status = ?, resolved_at = ?, resolved_by = ? WHERE id = ?", args: [approve ? "approved" : "denied", now, user.id, id] },
  ];
  if (approve && row.user_id != null) {
    stmts.push({
      sql: "INSERT OR IGNORE INTO org_members (org_slug, user_id, since, joined_at) VALUES (?, ?, ?, ?)",
      args: [slug, String(row.user_id), monthLabel(now), now],
    });
  }
  await c.batch(stmts, "write");
}

/** Members of the leader's org. */
export async function orgMembers(c: Client, user: UserRow): Promise<OrgMember[]> {
  const org = managedOrg(user);
  if (!org) return [];
  const res = await c.execute({
    sql: `SELECT u.name, u.email, u.program, u.avatar_color, m.since, m.title, m.status
          FROM org_members m JOIN users u ON u.id = m.user_id WHERE m.org_slug = ? ORDER BY m.joined_at ASC`,
    args: [org],
  });
  return res.rows.map((r) => ({
    name: String(r.name),
    email: String(r.email),
    program: String(r.program ?? ""),
    since: String(r.since),
    title: String(r.title),
    status: String(r.status) === "Inactive" ? "Inactive" : "Active",
    avatarColor: String(r.avatar_color),
  }));
}

async function memberInManagedOrg(c: Client, user: UserRow, email: string) {
  const org = managedOrg(user);
  if (!org) throw new UserError("Only an organization's leader can manage its members.");
  const res = await c.execute({
    sql: "SELECT m.user_id FROM org_members m JOIN users u ON u.id = m.user_id WHERE m.org_slug = ? AND u.email = ?",
    args: [org, normEmail(email)],
  });
  const id = res.rows[0]?.user_id;
  if (id == null) throw new UserError("That person isn't a member of your organization.");
  return { org, userId: String(id) };
}

export async function setMemberStatus(c: Client, user: UserRow, email: string, status: MemberStatus) {
  if (status !== "Active" && status !== "Inactive") throw new UserError("Bad status");
  const { org, userId } = await memberInManagedOrg(c, user, email);
  await c.execute({ sql: "UPDATE org_members SET status = ? WHERE org_slug = ? AND user_id = ?", args: [status, org, userId] });
}

export async function removeOrgMember(c: Client, user: UserRow, email: string) {
  const { org, userId } = await memberInManagedOrg(c, user, email);
  if (userId === user.id) throw new UserError("You can't remove yourself from the organization you lead.");
  await c.execute({ sql: "DELETE FROM org_members WHERE org_slug = ? AND user_id = ?", args: [org, userId] });
}

// Re-exported for the server functions.
export { toSession };
export const SYNCED_KEY_LIST = Object.keys(SYNCED_KEYS) as SyncedKey[];
