// Finance ledger rules against a fresh database per test.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import * as core from "@/lib/core.server";
import { initSchema, type UserRow } from "@/lib/db.server";
import * as fin from "@/lib/finance.server";
import { ledgerTotals } from "@/lib/finance-shared";

let c: Client;
const dir = mkdtempSync(join(tmpdir(), "umunity-fin-"));
let n = 0;

async function signIn(email: string, password: string): Promise<UserRow> {
  const res = await core.authenticate(c, email, password, "127.0.0.1");
  if (!res.ok) throw new Error(`sign-in failed for ${email}`);
  return res.user;
}
const users = async () => ({
  leader: await signIn("leader@um.edu.ph", "leader123"),
  adviser: await signIn("adviser@um.edu.ph", "adviser123"),
  admin2: await signIn("admin2@um.edu.ph", "admin2123"),
  student: await signIn("student@um.edu.ph", "student123"),
});

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const pdf = () => fin.bytesToBase64(fin.demoReceiptPdf(["RECEIPT", "Total P 500.00"]));
const expense = {
  kind: "expense" as const,
  amountCents: 500_00,
  category: "Venue",
  description: "Function room deposit",
  occurredOn: "2026-10-01",
};

beforeEach(async () => {
  c = createClient({ url: `file:${join(dir, `f${++n}.db`)}` });
  await initSchema(c, { demo: true });
  await fin.ensureFinanceSchema(c);
});
afterEach(() => c.close());
afterAll(() => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best effort on Windows */
  }
});

describe("who can see and change the books", () => {
  it("lets the leader record, the adviser review, admins review any org and active members read", async () => {
    const u = await users();
    expect(await fin.financeAccess(c, u.leader, "cs-society")).toEqual({
      view: true,
      record: true,
      review: false,
    });
    expect(await fin.financeAccess(c, u.adviser, "cs-society")).toEqual({
      view: true,
      record: false,
      review: true,
    });
    expect(await fin.financeAccess(c, u.admin2, "theatre-guild")).toEqual({
      view: true,
      record: false,
      review: true,
    });
    // The demo student is an active member of cs-society, but not of debate-council (request pending).
    expect(await fin.financeAccess(c, u.student, "cs-society")).toEqual({
      view: true,
      record: false,
      review: false,
    });
    expect((await fin.financeAccess(c, u.student, "debate-council")).view).toBe(false);
    expect((await fin.financeAccess(c, u.leader, "theatre-guild")).view).toBe(false);
  });

  it("refuses records from anyone but the org's leader", async () => {
    const u = await users();
    await expect(fin.recordEntry(c, u.adviser, "cs-society", expense)).rejects.toThrow("leader");
    await expect(fin.recordEntry(c, u.student, "cs-society", expense)).rejects.toThrow("leader");
    await expect(fin.recordEntry(c, u.leader, "theatre-guild", expense)).rejects.toThrow("leader");
    await expect(fin.loadLedger(c, u.student, "debate-council")).rejects.toThrow("active members");
  });

  it("hides receipts from people outside the org", async () => {
    const u = await users();
    const { id } = await fin.recordEntry(c, u.leader, "cs-society", expense);
    const r = await fin.addReceipt(c, u.leader, id, { filename: "deposit.pdf", dataBase64: pdf() });
    expect((await fin.getReceipt(c, u.student, r.id)).mime).toBe("application/pdf");
    await core.leaveOrganization(c, u.student, "cs-society");
    await expect(fin.getReceipt(c, u.student, r.id)).rejects.toThrow(core.UserError);
  });
});

describe("recording", () => {
  it("validates amounts, categories, descriptions and dates", async () => {
    const { leader } = await users();
    await expect(
      fin.recordEntry(c, leader, "cs-society", { ...expense, amountCents: 0 }),
    ).rejects.toThrow("greater than zero");
    await expect(
      fin.recordEntry(c, leader, "cs-society", { ...expense, category: "Sponsorship" }),
    ).rejects.toThrow("category");
    await expect(
      fin.recordEntry(c, leader, "cs-society", { ...expense, description: "x" }),
    ).rejects.toThrow("Describe");
    await expect(
      fin.recordEntry(c, leader, "cs-society", { ...expense, occurredOn: "2999-01-01" }),
    ).rejects.toThrow("future");
    const { id } = await fin.recordEntry(c, leader, "cs-society", expense);
    const ledger = await fin.loadLedger(c, leader, "cs-society");
    const e = ledger.entries.find((x) => x.id === id)!;
    expect(e.status).toBe("recorded");
    expect(e.history.map((h) => h.action)).toEqual(["Recorded"]);
  });
});

describe("receipts", () => {
  it("accepts PDFs and images by content, and fingerprints them", async () => {
    const { leader } = await users();
    const { id } = await fin.recordEntry(c, leader, "cs-society", expense);
    await fin.addReceipt(c, leader, id, {
      filename: "../../etc/photo.png",
      dataBase64: fin.bytesToBase64(PNG),
    });
    const [r] = (await fin.loadLedger(c, leader, "cs-society")).entries.find(
      (x) => x.id === id,
    )!.receipts;
    expect(r.filename).toBe("photo.png");
    expect(r.mime).toBe("image/png");
    expect(r.sha256).toMatch(/^[0-9a-f]{64}$/);
    const back = await fin.getReceipt(c, leader, r.id);
    expect(fin.base64ToBytes(back.dataBase64)).toEqual(PNG);
  });

  it("rejects files that aren't receipts, whatever they're called", async () => {
    const { leader } = await users();
    const { id } = await fin.recordEntry(c, leader, "cs-society", expense);
    const html = fin.bytesToBase64(
      new TextEncoder().encode("<html><script>alert(1)</script></html>"),
    );
    await expect(
      fin.addReceipt(c, leader, id, { filename: "receipt.pdf", dataBase64: html }),
    ).rejects.toThrow("PDF or a photo");
    const big = new Uint8Array(4 * 1024 * 1024 + 1);
    big.set([0x25, 0x50, 0x44, 0x46, 0x2d]);
    await expect(
      fin.addReceipt(c, leader, id, { filename: "big.pdf", dataBase64: fin.bytesToBase64(big) }),
    ).rejects.toThrow("at most");
  });

  it("keeps removed receipts in the history", async () => {
    const { leader } = await users();
    const { id } = await fin.recordEntry(c, leader, "cs-society", expense);
    const r = await fin.addReceipt(c, leader, id, { filename: "wrong.pdf", dataBase64: pdf() });
    await fin.removeReceipt(c, leader, r.id);
    const e = (await fin.loadLedger(c, leader, "cs-society")).entries.find((x) => x.id === id)!;
    expect(e.receipts).toEqual([]);
    expect(e.history.map((h) => h.action)).toEqual([
      "Recorded",
      "Receipt added",
      "Receipt removed",
    ]);
  });
});

describe("review", () => {
  it("won't verify an expense without a receipt", async () => {
    const u = await users();
    const { id } = await fin.recordEntry(c, u.leader, "cs-society", expense);
    await expect(fin.reviewEntry(c, u.adviser, id, "verify", "")).rejects.toThrow("receipt");
    await fin.addReceipt(c, u.leader, id, { filename: "deposit.pdf", dataBase64: pdf() });
    await fin.reviewEntry(c, u.adviser, id, "verify", "Matches the receipt.");
    const e = (await fin.loadLedger(c, u.leader, "cs-society")).entries.find((x) => x.id === id)!;
    expect(e.status).toBe("verified");
    // Verified entries are locked.
    await expect(
      fin.addReceipt(c, u.leader, id, { filename: "late.pdf", dataBase64: pdf() }),
    ).rejects.toThrow("verified");
    await expect(fin.voidEntry(c, u.leader, id, "changed my mind")).rejects.toThrow(
      "correcting entry",
    );
  });

  it("sends a flagged entry back for review once the leader adds a receipt", async () => {
    const u = await users();
    const { id } = await fin.recordEntry(c, u.leader, "cs-society", expense);
    await expect(fin.reviewEntry(c, u.adviser, id, "flag", "")).rejects.toThrow(
      "what needs fixing",
    );
    await expect(fin.reviewEntry(c, u.leader, id, "flag", "Looks off")).rejects.toThrow("adviser");
    await fin.reviewEntry(c, u.adviser, id, "flag", "Please attach the official receipt.");
    await fin.addReceipt(c, u.leader, id, { filename: "deposit.pdf", dataBase64: pdf() });
    const e = (await fin.loadLedger(c, u.leader, "cs-society")).entries.find((x) => x.id === id)!;
    expect(e.status).toBe("recorded");
    expect(e.history.map((h) => h.action)).toEqual([
      "Recorded",
      "Flagged",
      "Receipt added",
      "Sent back for verification",
    ]);
  });

  it("lets income be verified without a receipt", async () => {
    const u = await users();
    const { id } = await fin.recordEntry(c, u.leader, "cs-society", {
      ...expense,
      kind: "income",
      category: "Membership dues",
      description: "Dues",
    });
    await fin.reviewEntry(c, u.admin2, id, "verify", "");
    expect(
      (await fin.loadLedger(c, u.leader, "cs-society")).entries.find((x) => x.id === id)!.status,
    ).toBe("verified");
  });
});

describe("voids and totals", () => {
  it("keeps voided entries visible with the reason, and out of the totals", async () => {
    const { leader } = await users();
    const a = await fin.recordEntry(c, leader, "cs-society", {
      ...expense,
      kind: "income",
      category: "Donation",
      description: "Alumni donation",
      amountCents: 1000_00,
    });
    const b = await fin.recordEntry(c, leader, "cs-society", expense);
    await expect(fin.voidEntry(c, leader, b.id, "")).rejects.toThrow("reason");
    await fin.voidEntry(c, leader, b.id, "Recorded twice by mistake");
    const ledger = await fin.loadLedger(c, leader, "cs-society");
    const voided = ledger.entries.find((x) => x.id === b.id)!;
    expect(voided.status).toBe("void");
    expect(voided.reviewNote).toBe("Recorded twice by mistake");
    const mine = ledger.entries.filter((x) => x.id === a.id || x.id === b.id);
    expect(ledgerTotals(mine)).toMatchObject({
      income: 1000_00,
      expenses: 0,
      balance: 1000_00,
      verifiedBalance: 0,
    });
    await expect(
      fin.addReceipt(c, leader, b.id, { filename: "x.pdf", dataBase64: pdf() }),
    ).rejects.toThrow("voided");
  });
});

describe("demo data", () => {
  it("seeds the demo books once", async () => {
    const { leader } = await users();
    const first = await fin.loadLedger(c, leader, "cs-society", { demo: true });
    const again = await fin.loadLedger(c, leader, "cs-society", { demo: true });
    expect(first.entries.length).toBe(6);
    expect(again.entries.length).toBe(6);
    expect(again.entries.flatMap((e) => e.history).length).toBe(
      first.entries.flatMap((e) => e.history).length,
    );
  });
});
