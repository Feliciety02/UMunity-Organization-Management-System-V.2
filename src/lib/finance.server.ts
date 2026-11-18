// Organization finances: a ledger of money in and out, with receipts stored in the database.
// Built for transparency:
//  - Entries are never edited or deleted. A mistake is voided with a reason, and the void stays visible.
//  - Every action (recording, receipts, verification, flags, voids) is written to an append-only history.
//  - Receipts are checked by content (PDF, PNG, JPEG or WebP only) and fingerprinted with SHA-256.
//  - The org's leader records; its adviser (or an admin) verifies. An expense can't be verified
//    without a receipt. Active members can read their org's books.
import type { Client, InStatement } from "@libsql/client";
import { organizations } from "@/data/orgs";
import { UserError } from "@/lib/core.server";
import type { UserRow } from "@/lib/db.server";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  MAX_AMOUNT_CENTS,
  MAX_RECEIPT_BYTES,
  MAX_RECEIPTS_PER_ENTRY,
  type FinanceAccess,
  type FinanceEntry,
  type FinanceHistory,
  type FinanceKind,
  type FinanceStatus,
  type Ledger,
  type ReceiptMeta,
} from "@/lib/finance-shared";

export const FINANCE_SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS finance_entries (
    id TEXT PRIMARY KEY,
    org_slug TEXT NOT NULL,
    kind TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    occurred_on TEXT NOT NULL,
    workflow_id TEXT,
    event_title TEXT,
    status TEXT NOT NULL,
    review_note TEXT,
    created_by TEXT,
    created_by_name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS finance_entries_org ON finance_entries(org_slug, occurred_on)`,
  `CREATE TABLE IF NOT EXISTS finance_receipts (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    data BLOB NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at INTEGER NOT NULL,
    removed_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS finance_receipts_entry ON finance_receipts(entry_id)`,
  `CREATE TABLE IF NOT EXISTS finance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id TEXT NOT NULL,
    at INTEGER NOT NULL,
    by_name TEXT NOT NULL,
    by_role TEXT NOT NULL,
    action TEXT NOT NULL,
    note TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS finance_history_entry ON finance_history(entry_id)`,
];

const ADMINS = ["admin", "admin1", "admin2"];

const ready = new WeakSet<Client>();
/** Create the finance tables on first use (kept here so db.server.ts needn't import this module). */
export async function ensureFinanceSchema(c: Client) {
  if (ready.has(c)) return;
  await c.batch(FINANCE_SCHEMA, "write");
  ready.add(c);
}
const orgBySlug = (slug: string) => organizations.find((o) => o.slug === slug);

// ---------- Access ----------

/** What this user may do with one organization's books. */
export async function financeAccess(c: Client, user: UserRow, slug: string): Promise<FinanceAccess> {
  const org = orgBySlug(slug);
  if (!org) return { view: false, record: false, review: false };
  const record = user.role === "leader" && user.org === org.name;
  const review = ADMINS.includes(user.role) || (user.role === "adviser" && user.org === org.name);
  let member = false;
  if (!record && !review && user.role === "student") {
    const res = await c.execute({
      sql: "SELECT 1 FROM org_members WHERE org_slug = ? AND user_id = ? AND status = 'Active'",
      args: [slug, user.id],
    });
    member = res.rows.length > 0;
  }
  return { view: record || review || member, record, review };
}

/** Organizations whose books this user can open. */
export async function financeOrgs(c: Client, user: UserRow) {
  let slugs: string[];
  if (ADMINS.includes(user.role)) slugs = organizations.map((o) => o.slug);
  else if (user.role === "leader" || user.role === "adviser") slugs = organizations.filter((o) => o.name === user.org).map((o) => o.slug);
  else {
    const res = await c.execute({ sql: "SELECT org_slug FROM org_members WHERE user_id = ? AND status = 'Active'", args: [user.id] });
    slugs = res.rows.map((r) => String(r.org_slug));
  }
  return slugs.map((slug) => ({ slug, name: orgBySlug(slug)?.name ?? slug })).filter((o) => orgBySlug(o.slug));
}

async function requireAccess(c: Client, user: UserRow, slug: string, need: keyof FinanceAccess) {
  const access = await financeAccess(c, user, slug);
  if (!access[need]) {
    throw new UserError(
      need === "view"
        ? "Only this organization's officers, adviser, admins and active members can see its finances."
        : need === "record"
          ? "Only this organization's leader can record transactions."
          : "Only this organization's adviser or an admin can review transactions.",
    );
  }
  return access;
}

async function entryRow(c: Client, id: string) {
  const res = await c.execute({ sql: "SELECT * FROM finance_entries WHERE id = ?", args: [String(id)] });
  if (!res.rows.length) throw new UserError("That transaction doesn't exist.");
  return res.rows[0];
}

const historyStmt = (entryId: string, user: { name: string; role: string }, action: string, note: string | null, now: number): InStatement => ({
  sql: "INSERT INTO finance_history (entry_id, at, by_name, by_role, action, note) VALUES (?, ?, ?, ?, ?, ?)",
  args: [entryId, now, user.name, user.role, action, note],
});

// ---------- Reading ----------

export async function loadLedger(c: Client, user: UserRow, slug: string, opts: { demo?: boolean } = {}): Promise<Ledger> {
  if (opts.demo) await seedFinanceDemo(c);
  const access = await requireAccess(c, user, slug, "view");
  const [entries, receipts, history] = await Promise.all([
    c.execute({ sql: "SELECT * FROM finance_entries WHERE org_slug = ? ORDER BY occurred_on DESC, created_at DESC", args: [slug] }),
    c.execute({
      sql: `SELECT r.id, r.entry_id, r.filename, r.mime, r.size, r.sha256, r.uploaded_by_name, r.uploaded_at
            FROM finance_receipts r JOIN finance_entries e ON e.id = r.entry_id
            WHERE e.org_slug = ? AND r.removed_at IS NULL ORDER BY r.uploaded_at`,
      args: [slug],
    }),
    c.execute({
      sql: `SELECT h.entry_id, h.at, h.by_name, h.by_role, h.action, h.note
            FROM finance_history h JOIN finance_entries e ON e.id = h.entry_id WHERE e.org_slug = ? ORDER BY h.id`,
      args: [slug],
    }),
  ]);
  const receiptsBy = new Map<string, ReceiptMeta[]>();
  for (const r of receipts.rows) {
    const list = receiptsBy.get(String(r.entry_id)) ?? [];
    list.push({
      id: String(r.id),
      filename: String(r.filename),
      mime: String(r.mime),
      size: Number(r.size),
      sha256: String(r.sha256),
      uploadedBy: String(r.uploaded_by_name),
      uploadedAt: Number(r.uploaded_at),
    });
    receiptsBy.set(String(r.entry_id), list);
  }
  const historyBy = new Map<string, FinanceHistory[]>();
  for (const h of history.rows) {
    const list = historyBy.get(String(h.entry_id)) ?? [];
    list.push({ at: Number(h.at), by: String(h.by_name), role: String(h.by_role), action: String(h.action), note: h.note == null ? null : String(h.note) });
    historyBy.set(String(h.entry_id), list);
  }
  const out: FinanceEntry[] = entries.rows.map((r) => ({
    id: String(r.id),
    kind: String(r.kind) as FinanceKind,
    amountCents: Number(r.amount_cents),
    category: String(r.category),
    description: String(r.description),
    occurredOn: String(r.occurred_on),
    workflowId: r.workflow_id == null ? null : String(r.workflow_id),
    eventTitle: r.event_title == null ? null : String(r.event_title),
    status: String(r.status) as FinanceStatus,
    reviewNote: r.review_note == null ? null : String(r.review_note),
    createdBy: String(r.created_by_name),
    createdAt: Number(r.created_at),
    receipts: receiptsBy.get(String(r.id)) ?? [],
    history: historyBy.get(String(r.id)) ?? [],
  }));
  return { org: { slug, name: orgBySlug(slug)!.name }, access, entries: out };
}

// ---------- Recording ----------

export type NewEntry = {
  kind: FinanceKind;
  amountCents: number;
  category: string;
  description: string;
  occurredOn: string;
  workflowId?: string | null;
  eventTitle?: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function recordEntry(c: Client, user: UserRow, slug: string, input: NewEntry, now = Date.now()) {
  await requireAccess(c, user, slug, "record");
  const kind = input.kind;
  if (kind !== "income" && kind !== "expense") throw new UserError("Choose money in or money out.");
  const amount = Math.round(Number(input.amountCents));
  if (!Number.isFinite(amount) || amount <= 0) throw new UserError("Enter an amount greater than zero.");
  if (amount > MAX_AMOUNT_CENTS) throw new UserError("That amount is too large for a single transaction.");
  const categories: readonly string[] = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!categories.includes(input.category)) throw new UserError("Choose a category from the list.");
  const description = String(input.description ?? "").trim();
  if (description.length < 3) throw new UserError("Describe what the money was for.");
  if (description.length > 300) throw new UserError("Keep the description under 300 characters.");
  const occurredOn = String(input.occurredOn ?? "");
  if (!DATE.test(occurredOn) || Number.isNaN(Date.parse(occurredOn))) throw new UserError("Enter the date of the transaction.");
  if (Date.parse(occurredOn) > now + 24 * 60 * 60 * 1000) throw new UserError("The date can't be in the future.");
  const workflowId = input.workflowId ? String(input.workflowId).slice(0, 120) : null;
  const eventTitle = workflowId && input.eventTitle ? String(input.eventTitle).trim().slice(0, 160) : null;

  const id = `fin-${crypto.randomUUID()}`;
  await c.batch(
    [
      {
        sql: `INSERT INTO finance_entries (id, org_slug, kind, amount_cents, category, description, occurred_on, workflow_id, event_title,
                status, created_by, created_by_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'recorded', ?, ?, ?)`,
        args: [id, slug, kind, amount, input.category, description, occurredOn, workflowId, eventTitle, user.id, user.name, now],
      },
      historyStmt(id, user, "Recorded", null, now),
    ],
    "write",
  );
  return { id };
}

// ---------- Receipts ----------

/** Identify the file by its first bytes, never by the name or the browser's claim. */
export function sniffReceipt(bytes: Uint8Array): { mime: string; ext: string } | null {
  const starts = (sig: number[], at = 0) => sig.every((b, i) => bytes[at + i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: "application/pdf", ext: "pdf" };
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  if (starts([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return { mime: "image/webp", ext: "webp" };
  return null;
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function sha256Of(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cleanFilename(name: string, ext: string) {
  const base = String(name ?? "")
    .split(/[\\/]/)
    .pop()!
    .replace(/[^\w.\- ()]+/g, "_")
    .replace(/\.[^.]*$/, "")
    .trim()
    .slice(0, 100);
  return `${base || "receipt"}.${ext}`;
}

export async function addReceipt(c: Client, user: UserRow, entryId: string, file: { filename: string; dataBase64: string }, now = Date.now()) {
  const entry = await entryRow(c, entryId);
  await requireAccess(c, user, String(entry.org_slug), "record");
  const status = String(entry.status);
  if (status === "verified" || status === "void") throw new UserError(`Receipts can't be added to a ${status === "void" ? "voided" : "verified"} transaction.`);
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(String(file.dataBase64 ?? ""));
  } catch {
    throw new UserError("That file couldn't be read.");
  }
  if (!bytes.length) throw new UserError("That file is empty.");
  if (bytes.length > MAX_RECEIPT_BYTES) throw new UserError(`Receipts can be at most ${Math.round(MAX_RECEIPT_BYTES / 1024 / 1024)} MB.`);
  const type = sniffReceipt(bytes);
  if (!type) throw new UserError("Upload a PDF or a photo (JPG, PNG or WebP) of the receipt.");
  const count = await c.execute({ sql: "SELECT COUNT(*) AS n FROM finance_receipts WHERE entry_id = ? AND removed_at IS NULL", args: [entryId] });
  if (Number(count.rows[0].n) >= MAX_RECEIPTS_PER_ENTRY) throw new UserError(`A transaction can have at most ${MAX_RECEIPTS_PER_ENTRY} receipts.`);

  const sha = await sha256Of(bytes);
  const id = `rcpt-${crypto.randomUUID()}`;
  const filename = cleanFilename(file.filename, type.ext);
  const stmts: InStatement[] = [
    {
      sql: `INSERT INTO finance_receipts (id, entry_id, filename, mime, size, sha256, data, uploaded_by_name, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, entryId, filename, type.mime, bytes.length, sha, bytes, user.name, now],
    },
    historyStmt(entryId, user, "Receipt added", `${filename} · SHA-256 ${sha.slice(0, 12)}`, now),
  ];
  // A flagged entry goes back to the reviewer once the leader adds what was missing.
  if (status === "flagged") {
    stmts.push({ sql: "UPDATE finance_entries SET status = 'recorded' WHERE id = ? AND status = 'flagged'", args: [entryId] });
    stmts.push(historyStmt(entryId, user, "Sent back for verification", null, now));
  }
  await c.batch(stmts, "write");
  return { id };
}

/** Take a wrongly uploaded receipt off an unverified entry. The file stays on record for the audit trail. */
export async function removeReceipt(c: Client, user: UserRow, receiptId: string, now = Date.now()) {
  const res = await c.execute({
    sql: "SELECT r.entry_id, r.filename, r.sha256, e.org_slug, e.status FROM finance_receipts r JOIN finance_entries e ON e.id = r.entry_id WHERE r.id = ? AND r.removed_at IS NULL",
    args: [String(receiptId)],
  });
  if (!res.rows.length) throw new UserError("That receipt doesn't exist.");
  const r = res.rows[0];
  await requireAccess(c, user, String(r.org_slug), "record");
  if (String(r.status) === "verified" || String(r.status) === "void") throw new UserError("Receipts on verified or voided transactions can't be removed.");
  await c.batch(
    [
      { sql: "UPDATE finance_receipts SET removed_at = ? WHERE id = ?", args: [now, String(receiptId)] },
      historyStmt(String(r.entry_id), user, "Receipt removed", `${String(r.filename)} · SHA-256 ${String(r.sha256).slice(0, 12)}`, now),
    ],
    "write",
  );
}

export async function getReceipt(c: Client, user: UserRow, receiptId: string) {
  const res = await c.execute({
    sql: "SELECT r.filename, r.mime, r.data, e.org_slug FROM finance_receipts r JOIN finance_entries e ON e.id = r.entry_id WHERE r.id = ?",
    args: [String(receiptId)],
  });
  if (!res.rows.length) throw new UserError("That receipt doesn't exist.");
  const r = res.rows[0];
  await requireAccess(c, user, String(r.org_slug), "view");
  const data = r.data as ArrayBuffer | Uint8Array;
  return { filename: String(r.filename), mime: String(r.mime), dataBase64: bytesToBase64(data instanceof Uint8Array ? data : new Uint8Array(data)) };
}

// ---------- Review and voids ----------

export async function reviewEntry(c: Client, user: UserRow, entryId: string, decision: "verify" | "flag", note: string, now = Date.now()) {
  const entry = await entryRow(c, entryId);
  await requireAccess(c, user, String(entry.org_slug), "review");
  const text = String(note ?? "").trim().slice(0, 500);
  if (decision === "flag") {
    if (text.length < 3) throw new UserError("Say what needs fixing so the leader can act on it.");
    const res = await c.execute({ sql: "UPDATE finance_entries SET status = 'flagged', review_note = ? WHERE id = ? AND status = 'recorded'", args: [text, entryId] });
    if (!res.rowsAffected) throw new UserError("Only transactions waiting for review can be flagged.");
    await c.execute(historyStmt(entryId, user, "Flagged", text, now));
    return;
  }
  if (decision !== "verify") throw new UserError("Unknown decision.");
  if (String(entry.kind) === "expense") {
    const n = await c.execute({ sql: "SELECT COUNT(*) AS n FROM finance_receipts WHERE entry_id = ? AND removed_at IS NULL", args: [entryId] });
    if (!Number(n.rows[0].n)) throw new UserError("An expense needs at least one receipt before it can be verified.");
  }
  const res = await c.execute({
    sql: "UPDATE finance_entries SET status = 'verified', review_note = ? WHERE id = ? AND status IN ('recorded', 'flagged')",
    args: [text || null, entryId],
  });
  if (!res.rowsAffected) throw new UserError("This transaction was already verified or voided.");
  await c.execute(historyStmt(entryId, user, "Verified", text || null, now));
}

/** Cancel a mistaken entry. It stays in the ledger, marked void with the reason, and stops counting. */
export async function voidEntry(c: Client, user: UserRow, entryId: string, reason: string, now = Date.now()) {
  const entry = await entryRow(c, entryId);
  await requireAccess(c, user, String(entry.org_slug), "record");
  const text = String(reason ?? "").trim().slice(0, 500);
  if (text.length < 3) throw new UserError("Give a reason for voiding, so members can see why.");
  const res = await c.execute({ sql: "UPDATE finance_entries SET status = 'void', review_note = ? WHERE id = ? AND status IN ('recorded', 'flagged')", args: [text, entryId] });
  if (!res.rowsAffected) {
    throw new UserError("Verified transactions can't be voided. Record a correcting entry instead, so the history stays intact.");
  }
  await c.execute(historyStmt(entryId, user, "Voided", text, now));
}

// ---------- Demo data ----------

/** A small one-page PDF, so the demo receipts open like real ones. */
export function demoReceiptPdf(lines: string[]): Uint8Array {
  const esc = (s: string) => s.replace(/[\\()]/g, (m) => `\\${m}`);
  const text = lines.map((l, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 56 ${760 - i * 22} Td (${esc(l)}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 820] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

async function seedFinanceDemo(c: Client) {
  // Claim the flag first, so two first visits at once can't both seed.
  const claim = await c.execute({ sql: "INSERT OR IGNORE INTO meta (key, value) VALUES ('demo_finance', ?)", args: [String(Date.now())] });
  if (!claim.rowsAffected) return;
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const iso = (daysAgo: number) => new Date(now - daysAgo * day).toISOString().slice(0, 10);
  const leader = { name: "Marco Reyes", role: "leader" };
  const adviser = { name: "Prof. Elena Tan", role: "adviser" };
  type Seed = { id: string; kind: FinanceKind; amount: number; category: string; description: string; daysAgo: number; event?: [string, string]; status: FinanceStatus; note?: string; receipt?: string[] };
  const seeds: Seed[] = [
    { id: "fin-demo-dues", kind: "income", amount: 1_500_00, category: "Membership dues", description: "First-semester membership dues (30 members × ₱50)", daysAgo: 60, status: "verified" },
    { id: "fin-demo-allocation", kind: "income", amount: 10_000_00, category: "University allocation", description: "Student activity fund allocation, AY 2026-2027", daysAgo: 45, status: "verified" },
    { id: "fin-demo-sponsor", kind: "income", amount: 5_000_00, category: "Sponsorship", description: "Sponsorship from a local tech company for the Tech Talk", daysAgo: 30, event: ["workflow-ai-education", "Tech Talk: AI in Education"], status: "recorded" },
    { id: "fin-demo-tokens", kind: "expense", amount: 1_850_00, category: "Awards & prizes", description: "Speaker tokens and certificates", daysAgo: 20, event: ["workflow-ai-education", "Tech Talk: AI in Education"], status: "verified", receipt: ["OFFICIAL RECEIPT", "Token & Certificate Shop", "Speaker tokens x3 .......... P 1,500.00", "Certificate printing ......... P 350.00", "TOTAL ....................... P 1,850.00"] },
    { id: "fin-demo-print", kind: "expense", amount: 650_00, category: "Printing & supplies", description: "Event programs and posters", daysAgo: 18, event: ["workflow-ai-education", "Tech Talk: AI in Education"], status: "recorded", receipt: ["SALES INVOICE", "Campus Print Shop", "Programs x100 ................. P 400.00", "Posters x5 .................... P 250.00", "TOTAL .......................... P 650.00"] },
    { id: "fin-demo-snacks", kind: "expense", amount: 2_400_00, category: "Food & refreshments", description: "Snacks for volunteers and panel speakers", daysAgo: 17, event: ["workflow-ai-education", "Tech Talk: AI in Education"], status: "flagged", note: "No receipt attached yet. Please upload the official receipt from the caterer." },
  ];
  const stmts: InStatement[] = [];
  for (const s of seeds) {
    const created = now - s.daysAgo * day;
    stmts.push({
      sql: `INSERT OR IGNORE INTO finance_entries (id, org_slug, kind, amount_cents, category, description, occurred_on, workflow_id, event_title,
              status, review_note, created_by, created_by_name, created_at) VALUES (?, 'cs-society', ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      args: [s.id, s.kind, s.amount, s.category, s.description, iso(s.daysAgo), s.event?.[0] ?? null, s.event?.[1] ?? null, s.status, s.note ?? null, leader.name, created],
    });
    stmts.push(historyStmt(s.id, leader, "Recorded", null, created));
    if (s.receipt) {
      const bytes = demoReceiptPdf(s.receipt);
      const sha = await sha256Of(bytes);
      const filename = `${s.id.replace("fin-demo-", "")}-receipt.pdf`;
      stmts.push({
        sql: `INSERT OR IGNORE INTO finance_receipts (id, entry_id, filename, mime, size, sha256, data, uploaded_by_name, uploaded_at)
              VALUES (?, ?, ?, 'application/pdf', ?, ?, ?, ?, ?)`,
        args: [`rcpt-${s.id}`, s.id, filename, bytes.length, sha, bytes, leader.name, created + 60_000],
      });
      stmts.push(historyStmt(s.id, leader, "Receipt added", `${filename} · SHA-256 ${sha.slice(0, 12)}`, created + 60_000));
    }
    if (s.status === "verified") stmts.push(historyStmt(s.id, adviser, "Verified", null, created + 2 * day));
    if (s.status === "flagged") stmts.push(historyStmt(s.id, adviser, "Flagged", s.note ?? null, created + day));
  }
  await c.batch(stmts, "write");
}
