// Server-only database access (Turso / libSQL). Never import this from client code:
// only server modules (core.server.ts, api.functions.ts handlers) use it.
import { createClient, type Client } from "@libsql/client";
import { DEMO_USERS, type Role, type Session } from "@/lib/auth";

let client: Client | undefined;
let ready: Promise<void> | undefined;

/**
 * Demo accounts (passwords are printed on the sign-in page) exist only in development,
 * unless ENABLE_DEMO_ACCOUNTS=true is set on purpose (e.g. a classroom demo deployment).
 */
export function demoAccountsEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_ACCOUNTS === "true";
}

/**
 * TURSO_DATABASE_URL: a libsql://... URL from Turso in production, or a local file.
 * With nothing set, development uses ./local.db so the app runs without an account.
 */
function connect(): Client {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL || (process.env.NODE_ENV === "production" ? "" : "file:local.db");
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set. Add your Turso database URL and TURSO_AUTH_TOKEN to the environment.");
  }
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
  return client;
}

/** Returns a connected client with the schema created and the demo data in the right state. */
export async function db(): Promise<Client> {
  const c = connect();
  ready ??= initSchema(c, { demo: demoAccountsEnabled() }).catch((err) => {
    ready = undefined; // retry on the next request instead of caching the failure
    throw err;
  });
  await ready;
  return c;
}

export async function initSchema(c: Client, opts: { demo: boolean }) {
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        program TEXT,
        org TEXT,
        avatar_color TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
      // Whole-value storage for data that isn't a list of identified items.
      `CREATE TABLE IF NOT EXISTS app_data (
        scope TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        updated_by TEXT,
        PRIMARY KEY (scope, key)
      )`,
      // Item-level storage: one row per list item (or object field), so edits to different
      // items by different people never overwrite each other.
      `CREATE TABLE IF NOT EXISTS app_items (
        scope TEXT NOT NULL,
        key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        kind TEXT NOT NULL,
        position REAL NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        updated_by TEXT,
        PRIMARY KEY (scope, key, item_key)
      )`,
      `CREATE TABLE IF NOT EXISTS login_attempts (
        key TEXT PRIMARY KEY,
        failures INTEGER NOT NULL,
        window_start INTEGER NOT NULL,
        locked_until INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS org_members (
        org_slug TEXT NOT NULL,
        user_id TEXT NOT NULL,
        since TEXT NOT NULL,
        joined_at INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT 'Member',
        status TEXT NOT NULL DEFAULT 'Active',
        PRIMARY KEY (org_slug, user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS membership_requests (
        id TEXT PRIMARY KEY,
        org_slug TEXT NOT NULL,
        user_id TEXT,
        name TEXT NOT NULL,
        program TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        resolved_at INTEGER,
        resolved_by TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS membership_requests_org ON membership_requests(org_slug, status)`,
      `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
    ],
    "write",
  );

  if (opts.demo) await seedDemo(c);
  else await disableDemoAccounts(c);
}

async function seedDemo(c: Client) {
  // Demo accounts shown on the sign-in page (only the ones that are missing).
  const existing = await c.execute({
    sql: `SELECT email, password_hash FROM users WHERE email IN (${DEMO_USERS.map(() => "?").join(",")})`,
    args: DEMO_USERS.map((u) => u.email),
  });
  const have = new Map(existing.rows.map((r) => [String(r.email), String(r.password_hash)]));
  for (const u of DEMO_USERS) {
    const hash = have.get(u.email);
    if (hash && hash !== DISABLED) continue;
    if (hash === DISABLED) {
      await c.execute({ sql: "UPDATE users SET password_hash = ? WHERE email = ?", args: [await hashPassword(u.password), u.email] });
      continue;
    }
    await c.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, name, role, program, org, avatar_color, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [crypto.randomUUID(), u.email, u.name, u.role, u.program ?? null, u.org ?? null, u.avatarColor, await hashPassword(u.password), Date.now()],
    });
  }

  // Demo memberships and join requests, once.
  const seeded = await c.execute("SELECT 1 FROM meta WHERE key = 'demo_memberships'");
  if (seeded.rows.length) return;
  const student = await c.execute("SELECT id, name, program FROM users WHERE email = 'student@um.edu.ph'");
  const s = student.rows[0];
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const stmts: Array<{ sql: string; args: Array<string | number | null> }> = [];
  if (s) {
    for (const [slug, since] of [["cs-society", "Mar 2026"], ["eco-warriors", "Mar 2026"], ["theatre-guild", "Apr 2026"]]) {
      stmts.push({ sql: "INSERT OR IGNORE INTO org_members (org_slug, user_id, since, joined_at) VALUES (?, ?, ?, ?)", args: [slug, String(s.id), since, now] });
    }
    stmts.push({
      sql: `INSERT OR IGNORE INTO membership_requests (id, org_slug, user_id, name, program, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      args: ["demo-althea-debate", "debate-council", String(s.id), String(s.name), String(s.program ?? ""), "I'd love to sharpen my public speaking.", now - 3 * 24 * hour],
    });
  }
  // Demo officers of the CS Society: listed on the roster, but they can't sign in.
  const officers = [
    ["anna.sy@umindanao.edu.ph", "Anna Sy", "Officer · VP", "Mar 2024", "from-primary to-primary"],
    ["karl.m@umindanao.edu.ph", "Karl Mendez", "Officer · Sec", "Mar 2024", "from-rose-400 to-primary"],
    ["jaymark.burlado@umindanao.edu.ph", "Jaymark Burlado", "Member", "Apr 2024", "from-emerald-400 to-primary-deep"],
  ] as const;
  for (const [email, name, title, since, color] of officers) {
    const id = `demo-${email.split("@")[0]}`;
    stmts.push({
      sql: `INSERT OR IGNORE INTO users (id, email, name, role, program, org, avatar_color, password_hash, created_at) VALUES (?, ?, ?, 'student', NULL, NULL, ?, ?, ?)`,
      args: [id, email, name, color, DISABLED, now],
    });
    stmts.push({
      sql: "INSERT OR IGNORE INTO org_members (org_slug, user_id, since, joined_at, title) VALUES ('cs-society', ?, ?, ?, ?)",
      args: [id, since, now - 400 * 24 * hour, title],
    });
  }
  const demoRequests = [
    ["jana-cruz", "Jana Cruz", "BS IT - 2nd Year", "I want to grow my coding skills and meet like-minded peers.", 2],
    ["marvin-lim", "Marvin Lim", "BS CS - 1st Year", "Big fan of the org's hackathons. Excited to contribute!", 3],
    ["ria-santos", "Ria Santos", "BS IS - 3rd Year", "Looking to lead UI/UX initiatives this semester.", 26],
    ["tomas-vega", "Tomas Vega", "BS CS - 4th Year", "Returning member after a year on exchange.", 28],
  ] as const;
  for (const [id, name, program, reason, hoursAgo] of demoRequests) {
    stmts.push({
      sql: `INSERT OR IGNORE INTO membership_requests (id, org_slug, user_id, name, program, reason, status, created_at) VALUES (?, 'cs-society', NULL, ?, ?, ?, 'pending', ?)`,
      args: [id, name, program, reason, now - hoursAgo * hour],
    });
  }
  stmts.push({ sql: "INSERT INTO meta (key, value) VALUES ('demo_memberships', ?)", args: [String(now)] });
  await c.batch(stmts, "write");
}

/** In production the published demo passwords must not work: lock those accounts and end their sessions. */
async function disableDemoAccounts(c: Client) {
  const emails = DEMO_USERS.map((u) => u.email);
  const marks = emails.map(() => "?").join(",");
  await c.batch(
    [
      { sql: `DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email IN (${marks}))`, args: emails },
      { sql: `UPDATE users SET password_hash = '${DISABLED}' WHERE email IN (${marks})`, args: emails },
    ],
    "write",
  );
}

// ---------- Passwords (PBKDF2-SHA256 via Web Crypto: works on Node, Workers and Vercel) ----------

/** Stored instead of a hash for accounts that must not be able to sign in. */
export const DISABLED = "disabled";
const ITERATIONS = 100_000; // Cloudflare Workers' maximum for PBKDF2

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string): Uint8Array<ArrayBuffer> => new Uint8Array(hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? []);

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(await pbkdf2(password, salt, ITERATIONS))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const actual = toHex(await pbkdf2(password, fromHex(salt), Number(iter)));
  // Constant-time comparison
  let diff = actual.length ^ hash.length;
  for (let i = 0; i < Math.min(actual.length, hash.length); i++) diff |= actual.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

export async function sha256Hex(text: string) {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

export function randomToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

// ---------- Row mapping ----------

export type UserRow = Session & { id: string; passwordHash: string };

export function rowToUser(row: Record<string, unknown>): UserRow {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: String(row.role) as Role,
    program: row.program == null ? undefined : String(row.program),
    org: row.org == null ? undefined : String(row.org),
    avatarColor: String(row.avatar_color),
    passwordHash: String(row.password_hash),
  };
}

export function toSession(user: UserRow): Session {
  const { id: _id, passwordHash: _hash, ...session } = user;
  return session;
}
