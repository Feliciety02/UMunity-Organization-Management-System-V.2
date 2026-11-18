// Server logic against a fresh database per test (a temp file: libsql transactions open a
// second connection, which an in-memory database can't share).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import * as core from "@/lib/core.server";
import { hashPassword, initSchema, rowToUser, verifyPassword, type UserRow } from "@/lib/db.server";

let c: Client;

async function signIn(email: string, password: string): Promise<UserRow> {
  const res = await core.authenticate(c, email, password, "127.0.0.1");
  if (!res.ok) throw new Error(`sign-in failed for ${email}: ${res.reason}`);
  return res.user;
}

async function reload(user: UserRow) {
  const res = await c.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [user.id] });
  return rowToUser(res.rows[0] as Record<string, unknown>);
}

const dir = mkdtempSync(join(tmpdir(), "umunity-test-"));
let n = 0;

beforeEach(async () => {
  c = createClient({ url: `file:${join(dir, `t${++n}.db`)}` });
  await initSchema(c, { demo: true });
});

afterEach(() => c.close());

// Windows can hold the files briefly after close, so cleanup is best effort.
afterAll(() => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* left for the OS temp cleanup */
  }
});

describe("passwords", () => {
  it("hashes with a salt and verifies", async () => {
    const a = await hashPassword("correct horse");
    const b = await hashPassword("correct horse");
    expect(a).not.toBe(b);
    expect(a.startsWith("pbkdf2$100000$")).toBe(true);
    expect(await verifyPassword("correct horse", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
  });
});

describe("sign-in", () => {
  it("accepts the right password and rejects a wrong one", async () => {
    expect((await core.authenticate(c, "student@um.edu.ph", "student123", "1.1.1.1")).ok).toBe(true);
    expect(await core.authenticate(c, "student@um.edu.ph", "nope", "1.1.1.1")).toEqual({ ok: false, reason: "invalid" });
    expect(await core.authenticate(c, "nobody@um.edu.ph", "x", "1.1.1.1")).toEqual({ ok: false, reason: "invalid" });
  });

  it("locks an email after repeated failures, even with the right password, then unlocks", async () => {
    const t0 = Date.now();
    for (let i = 0; i < core.THROTTLE.maxPerEmail; i++) await core.authenticate(c, "student@um.edu.ph", "bad", `10.0.0.${i}`, t0);
    const locked = await core.authenticate(c, "student@um.edu.ph", "student123", "10.0.0.99", t0 + 1000);
    expect(locked.ok).toBe(false);
    expect(locked.ok === false && locked.reason).toBe("locked");
    const later = await core.authenticate(c, "student@um.edu.ph", "student123", "10.0.0.99", t0 + core.THROTTLE.lockMs + 2000);
    expect(later.ok).toBe(true);
  });

  it("locks an IP that tries many accounts", async () => {
    const t0 = Date.now();
    for (let i = 0; i < core.THROTTLE.maxPerIp; i++) await core.authenticate(c, `user${i}@um.edu.ph`, "bad", "6.6.6.6", t0);
    const res = await core.authenticate(c, "leader@um.edu.ph", "leader123", "6.6.6.6", t0 + 1000);
    expect(res.ok === false && res.reason).toBe("locked");
    expect((await core.authenticate(c, "leader@um.edu.ph", "leader123", "7.7.7.7", t0 + 1000)).ok).toBe(true);
  });

  it("disables the published demo accounts when demo mode is off", async () => {
    await initSchema(c, { demo: false });
    expect((await core.authenticate(c, "admin@um.edu.ph", "admin123", "1.1.1.1")).ok).toBe(false);
  });
});

describe("sessions", () => {
  it("finds the user for a live token and nothing after expiry or sign-out", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    const now = Date.now();
    const { token } = await core.createSession(c, user.id, false, now);
    expect((await core.userForToken(c, token, now + 1000))?.email).toBe("student@um.edu.ph");
    expect(await core.userForToken(c, token, now + 2 * 24 * 60 * 60 * 1000)).toBeNull();
    await core.endSession(c, token);
    expect(await core.userForToken(c, token, now + 1000)).toBeNull();
  });

  it("prunes expired sessions when a new one starts", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    const old = Date.now() - 40 * 24 * 60 * 60 * 1000;
    await core.createSession(c, user.id, true, old);
    await core.createSession(c, user.id, true);
    const res = await c.execute("SELECT count(*) AS n FROM sessions");
    expect(Number(res.rows[0].n)).toBe(1);
  });
});

describe("accounts", () => {
  it("registers a student once per email", async () => {
    const input = { name: "Test Student", email: "Test.Student@umindanao.edu.ph", program: "BSIT 1", password: "longenough" };
    const first = await core.registerStudent(c, input);
    expect(first.ok).toBe(true);
    const again = await core.registerStudent(c, { ...input, email: "test.student@umindanao.edu.ph" });
    expect(again).toMatchObject({ ok: false, field: "email" });
    expect(await core.registerStudent(c, { ...input, email: "x@gmail.com" })).toMatchObject({ ok: false });
  });

  it("changes the password and signs out other sessions only", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    const keep = await core.createSession(c, user.id, true);
    const other = await core.createSession(c, user.id, true);
    await expect(core.changePassword(c, user, "wrong", "newpassword1")).rejects.toThrow(core.UserError);
    await core.changePassword(c, user, "student123", "newpassword1", keep.token);
    expect(await core.userForToken(c, keep.token)).not.toBeNull();
    expect(await core.userForToken(c, other.token)).toBeNull();
    expect((await core.authenticate(c, "student@um.edu.ph", "newpassword1", "1.1.1.1")).ok).toBe(true);
  });

  it("changes the email only with the password and to a free UM address", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    await expect(core.changeEmail(c, user, "student123", "leader@um.edu.ph")).rejects.toThrow("Another account");
    await expect(core.changeEmail(c, user, "student123", "me@gmail.com")).rejects.toThrow(core.UserError);
    const session = await core.changeEmail(c, user, "student123", "althea.d@umindanao.edu.ph");
    expect(session.email).toBe("althea.d@umindanao.edu.ph");
    expect((await core.authenticate(c, "althea.d@umindanao.edu.ph", "student123", "1.1.1.1")).ok).toBe(true);
  });

  it("deletes the account with its personal data", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    await core.saveWhole(c, user, "umunity.saved.v1", JSON.stringify({ posts: ["p1"], events: [] }));
    await core.deleteAccount(c, user, "student123");
    expect((await core.authenticate(c, "student@um.edu.ph", "student123", "2.2.2.2")).ok).toBe(false);
    const left = await c.execute({ sql: "SELECT count(*) AS n FROM app_items WHERE scope = ?", args: [`user:${user.id}`] });
    expect(Number(left.rows[0].n)).toBe(0);
    const memberships = await c.execute({ sql: "SELECT count(*) AS n FROM org_members WHERE user_id = ?", args: [user.id] });
    expect(Number(memberships.rows[0].n)).toBe(0);
  });
});

describe("password reset", () => {
  it("resets with a one-time token and ends existing sessions", async () => {
    const user = await signIn("student@um.edu.ph", "student123");
    const session = await core.createSession(c, user.id, true);
    expect(await core.createPasswordReset(c, "nobody@um.edu.ph")).toBeNull();
    const reset = (await core.createPasswordReset(c, "student@um.edu.ph"))!;
    await core.resetPassword(c, reset.token, "brand-new-pass");
    expect(await core.userForToken(c, session.token)).toBeNull();
    expect((await core.authenticate(c, "student@um.edu.ph", "brand-new-pass", "1.1.1.1")).ok).toBe(true);
    await expect(core.resetPassword(c, reset.token, "another-pass")).rejects.toThrow("invalid or has expired");
  });

  it("lifts a sign-in lockout", async () => {
    for (let i = 0; i < core.THROTTLE.maxPerEmail; i++) await core.authenticate(c, "student@um.edu.ph", "bad", `10.1.0.${i}`);
    const reset = (await core.createPasswordReset(c, "student@um.edu.ph"))!;
    await core.resetPassword(c, reset.token, "brand-new-pass");
    expect((await core.authenticate(c, "student@um.edu.ph", "brand-new-pass", "10.1.0.200")).ok).toBe(true);
  });

  it("rejects expired tokens", async () => {
    const now = Date.now();
    const reset = (await core.createPasswordReset(c, "student@um.edu.ph", now))!;
    await expect(core.resetPassword(c, reset.token, "brand-new-pass", now + core.RESET_TTL_MS + 1)).rejects.toThrow(core.UserError);
  });
});

describe("app data", () => {
  it("keeps concurrent edits to different items of a shared store", async () => {
    const leader = await signIn("leader@um.edu.ph", "leader123");
    const admin = await signIn("admin1@um.edu.ph", "admin1123");
    const key = "umunity.notifications.v2";
    await core.saveWhole(c, leader, key, JSON.stringify([{ id: "n1", read: false }, { id: "n2", read: false }]));
    // Both started from the same copy; each changes a different item.
    await core.patchData(c, leader, key, { kind: "array", upserts: [{ k: "n1", v: JSON.stringify({ id: "n1", read: true }), pos: 1024, ver: 1 }], deletes: [] });
    await core.patchData(c, admin, key, { kind: "array", upserts: [{ k: "n2", v: JSON.stringify({ id: "n2", read: true }), pos: 2048, ver: 1 }], deletes: [] });
    const loaded = await core.loadData(c, admin);
    expect(JSON.parse(loaded[key].value)).toEqual([
      { id: "n1", read: true },
      { id: "n2", read: true },
    ]);
    expect(loaded[key].versions).toEqual({ n1: 2, n2: 2 });
  });

  it("stops students from writing staff data", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    await expect(core.saveWhole(c, student, "umunity.workflows.v1", "[]")).rejects.toThrow("Your role");
    await expect(
      core.patchData(c, student, "umunity.admin.pending-orgs.v1", { kind: "array", upserts: [], deletes: [{ k: "x", ver: 1 }] }),
    ).rejects.toThrow(core.UserError);
    await expect(core.saveWhole(c, student, "umunity.not-a-key", "[]")).rejects.toThrow("Unknown data key");
  });

  it("keeps personal data separate per account", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    const other = await core.registerStudent(c, { name: "Other", email: "other@umindanao.edu.ph", program: "BSCS", password: "longenough" });
    if (!other.ok) throw new Error("register failed");
    await core.saveWhole(c, student, "umunity.saved.v1", JSON.stringify({ posts: ["p9"], events: [] }));
    expect((await core.loadData(c, other.user))["umunity.saved.v1"]).toBeUndefined();
    expect(JSON.parse((await core.loadData(c, student))["umunity.saved.v1"].value)).toEqual({ posts: ["p9"], events: [] });
  });

  it("refuses a patch on a value still stored whole, so no items are lost", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    await c.execute({
      sql: "INSERT INTO app_data (scope, key, value, updated_at) VALUES (?, 'umunity.rsvps.v1', ?, 0)",
      args: [`user:${student.id}`, JSON.stringify([{ eventTitle: "A" }, { eventTitle: "B" }])],
    });
    await expect(
      core.patchData(c, student, "umunity.rsvps.v1", { kind: "array", upserts: [{ k: "A", v: '{"eventTitle":"A","x":1}', pos: 1024, ver: 0 }], deletes: [] }),
    ).rejects.toThrow(core.ReshapeError);
    expect(JSON.parse((await core.loadData(c, student))["umunity.rsvps.v1"].value)).toHaveLength(2);
  });

  it("stores values that can't be split as a whole", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    await core.saveWhole(c, student, "umunity.messages.v1", JSON.stringify(["a", "b"]));
    expect((await core.loadData(c, student))["umunity.messages.v1"].value).toBe('["a","b"]');
  });
});

describe("same-item conflicts", () => {
  const key = "umunity.notifications.v2";
  const up = (k: string, v: object, ver: number, pos = 1024) => ({ kind: "array" as const, upserts: [{ k, v: JSON.stringify(v), pos, ver }], deletes: [] });

  it("refuses the second of two saves based on the same version", async () => {
    const a = await signIn("leader@um.edu.ph", "leader123");
    const b = await signIn("adviser@um.edu.ph", "adviser123");
    await core.saveWhole(c, a, key, JSON.stringify([{ id: "n1", text: "start" }]));
    await core.patchData(c, a, key, up("n1", { id: "n1", text: "from A" }, 1));
    await expect(core.patchData(c, b, key, up("n1", { id: "n1", text: "from B" }, 1))).rejects.toThrow(core.ConflictError);
    expect(JSON.parse((await core.loadData(c, a))[key].value)).toEqual([{ id: "n1", text: "from A" }]);
    // Based on the latest version, B's edit goes through.
    await core.patchData(c, b, key, up("n1", { id: "n1", text: "from B" }, 2));
    expect(JSON.parse((await core.loadData(c, a))[key].value)).toEqual([{ id: "n1", text: "from B" }]);
  });

  it("refuses creating an item someone else just created, and stale deletes", async () => {
    const a = await signIn("leader@um.edu.ph", "leader123");
    await core.patchData(c, a, key, up("n9", { id: "n9", text: "first" }, 0));
    await expect(core.patchData(c, a, key, up("n9", { id: "n9", text: "second" }, 0))).rejects.toThrow(core.ConflictError);
    await core.patchData(c, a, key, up("n9", { id: "n9", text: "edited" }, 1));
    await expect(core.patchData(c, a, key, { kind: "array", upserts: [], deletes: [{ k: "n9", ver: 1 }] })).rejects.toThrow(core.ConflictError);
  });

  it("applies a patch all or nothing", async () => {
    const a = await signIn("leader@um.edu.ph", "leader123");
    await core.saveWhole(c, a, key, JSON.stringify([{ id: "n1" }, { id: "n2" }]));
    await core.patchData(c, a, key, up("n2", { id: "n2", x: 1 }, 1, 2048));
    const stale = {
      kind: "array" as const,
      upserts: [
        { k: "n1", v: '{"id":"n1","x":2}', pos: 1024, ver: 1 },
        { k: "n2", v: '{"id":"n2","x":2}', pos: 2048, ver: 1 },
      ],
      deletes: [],
    };
    await expect(core.patchData(c, a, key, stale)).rejects.toThrow(core.ConflictError);
    expect(JSON.parse((await core.loadData(c, a))[key].value)).toEqual([{ id: "n1" }, { id: "n2", x: 1 }]);
  });

  it("keeps an emptied store as an empty placeholder", async () => {
    const a = await signIn("leader@um.edu.ph", "leader123");
    await core.saveWhole(c, a, key, JSON.stringify([{ id: "n1" }]));
    await core.patchData(c, a, key, { kind: "array", upserts: [], deletes: [{ k: "n1", ver: 1 }] });
    expect((await core.loadData(c, a))[key]).toEqual({ value: "[]" });
    // ...which the next patch replaces with item rows.
    await core.patchData(c, a, key, up("n2", { id: "n2" }, 0));
    expect((await core.loadData(c, a))[key].kind).toBe("array");
  });
});

describe("review steps", () => {
  const key = "umunity.workflows.v1";
  const CSS = "UM Computer Studies Society";
  const draft = { id: "w1", orgName: CSS, title: "Hackathon", status: "draft", comments: [] as object[], history: [] as object[] };
  let ver = 0;
  const save = async (user: UserRow, item: object) => {
    const res = await core.patchData(c, user, key, { kind: "array", upserts: [{ k: "w1", v: JSON.stringify(item), pos: 1024, ver }], deletes: [] });
    ver = res.versions.w1;
  };
  const users = async () => ({
    leader: await signIn("leader@um.edu.ph", "leader123"),
    adviser: await signIn("adviser@um.edu.ph", "adviser123"),
    admin2: await signIn("admin2@um.edu.ph", "admin2123"),
    admin1: await signIn("admin1@um.edu.ph", "admin1123"),
  });

  beforeEach(() => {
    ver = 0;
  });

  it("walks a workflow through each stage only with the right reviewer", async () => {
    const u = await users();
    await save(u.leader, draft);
    const submitted = { ...draft, status: "pending_adviser" };
    await expect(save(u.leader, { ...draft, status: "pending_admin1" })).rejects.toThrow("can't move this");
    await save(u.leader, submitted);
    await expect(save(u.leader, { ...submitted, status: "pending_admin2" })).rejects.toThrow(core.UserError);
    await expect(save(u.admin2, { ...submitted, status: "pending_admin2" })).rejects.toThrow("Your role can't move");
    const byAdviser = { ...submitted, status: "pending_admin2", history: [{ id: "h1", byRole: "adviser", action: "approved" }] };
    await save(u.adviser, byAdviser);
    await expect(save(u.adviser, { ...byAdviser, status: "pending_admin1" })).rejects.toThrow("Your role can't move");
    await save(u.admin2, { ...byAdviser, status: "pending_admin1" });
    await save(u.admin1, { ...byAdviser, status: "approved" });
    const loaded = JSON.parse((await core.loadData(c, u.leader))[key].value);
    expect(loaded[0].status).toBe("approved");
  });

  it("lets reviewers decide but not rewrite the submission", async () => {
    const u = await users();
    await save(u.leader, { ...draft, status: "pending_adviser" });
    await expect(save(u.adviser, { ...draft, status: "pending_admin2", title: "Changed" })).rejects.toThrow("not edit the submission");
    await save(u.adviser, { ...draft, status: "revision_requested" });
    // Back with the leader: now they may edit and resubmit.
    await save(u.leader, { ...draft, status: "revision_requested", title: "Hackathon v2" });
    await save(u.leader, { ...draft, status: "pending_adviser", title: "Hackathon v2" });
    await expect(save(u.leader, { ...draft, status: "pending_adviser", title: "Sneaky edit" })).rejects.toThrow("only be edited");
  });

  it("keeps comments and history append-only and signed by the actor", async () => {
    const u = await users();
    const withNote = { ...draft, status: "pending_adviser", comments: [{ id: "c1", authorRole: "leader", text: "please review" }] };
    await save(u.leader, withNote);
    await expect(save(u.adviser, { ...withNote, comments: [] })).rejects.toThrow("can't be edited or removed");
    await expect(save(u.adviser, { ...withNote, history: [{ id: "h1", byRole: "admin1" }] })).rejects.toThrow("your own role");
    await save(u.adviser, { ...withNote, comments: [...withNote.comments, { id: "c2", authorRole: "adviser", text: "looks good" }] });
  });

  it("keeps leaders to their own organization", async () => {
    const u = await users();
    await expect(save(u.leader, { ...draft, orgName: "UM Cultural Guild" })).rejects.toThrow("own organization");
    await save(u.leader, draft);
    await expect(save(u.leader, { ...draft, orgName: "UM Cultural Guild" })).rejects.toThrow("can't change");
    await expect(core.patchData(c, u.adviser, key, { kind: "array", upserts: [], deletes: [{ k: "w1", ver }] })).rejects.toThrow("delete");
    await core.patchData(c, u.admin1, key, { kind: "array", upserts: [], deletes: [{ k: "w1", ver }] });
  });

  it("steps the post-event closeout through its own reviewers", async () => {
    const u = await users();
    const withCloseout = (s: string, report = "Went well") => ({ ...draft, status: "approved", operations: { postEvent: { closeoutStatus: s, report } } });
    await c.execute({
      sql: "INSERT INTO app_items (scope, key, item_key, kind, position, value, updated_at, version) VALUES ('shared', ?, 'w1', 'array', 1024, ?, 0, 1)",
      args: [key, JSON.stringify(withCloseout("draft", ""))],
    });
    ver = 1;
    // Operations stay editable for the leader after approval; then they submit the closeout.
    await save(u.leader, withCloseout("draft"));
    await save(u.leader, withCloseout("pending_adviser"));
    await expect(save(u.admin1, withCloseout("pending_admin2"))).rejects.toThrow("closeout step");
    await save(u.adviser, withCloseout("pending_admin2"));
    await save(u.admin2, withCloseout("pending_admin1"));
    await expect(save(u.leader, { ...withCloseout("approved"), status: "completed" })).rejects.toThrow(core.UserError);
    await save(u.admin1, { ...withCloseout("approved"), status: "completed" });
  });

  it("checks whole saves item by item too", async () => {
    const u = await users();
    await core.saveWhole(c, u.leader, key, JSON.stringify([draft]));
    await expect(core.saveWhole(c, u.leader, key, JSON.stringify([{ ...draft, status: "approved" }]))).rejects.toThrow(core.UserError);
    await expect(core.saveWhole(c, u.leader, key, JSON.stringify([{ title: "no id" }]))).rejects.toThrow("needs an id");
    const saved = await core.saveWhole(c, u.leader, key, JSON.stringify([draft, { ...draft, id: "w2" }]));
    expect(saved.items).toEqual({ w1: [1024, 1], w2: [2048, 1] }); // unchanged w1 keeps its version
  });
});

describe("server seeding", () => {
  it("fills empty approval stores once, and starts them empty when given no seed", async () => {
    const admin = await signIn("admin1@um.edu.ph", "admin1123");
    const seeds = { "umunity.workflows.v1": () => [{ id: "s1", status: "approved" }], "umunity.transitions.v1": () => [] };
    const first = await core.loadData(c, admin, seeds);
    expect(JSON.parse(first["umunity.workflows.v1"].value)).toEqual([{ id: "s1", status: "approved" }]);
    expect(first["umunity.workflows.v1"].versions).toEqual({ s1: 1 });
    expect(first["umunity.transitions.v1"]).toEqual({ value: "[]" });
    // Once emptied, it stays empty instead of being seeded again.
    await core.patchData(c, admin, "umunity.workflows.v1", { kind: "array", upserts: [], deletes: [{ k: "s1", ver: 1 }] });
    expect((await core.loadData(c, admin, seeds))["umunity.workflows.v1"]).toEqual({ value: "[]" });
  });
});

describe("memberships", () => {
  it("routes a student's join request to the leader, and approval makes them a member", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    const leader = await signIn("leader@um.edu.ph", "leader123");
    // Demo: Althea is already in the CS Society; use another org's leader flow via the CS Society by leaving first.
    await core.leaveOrganization(c, student, "cs-society");
    expect((await core.myMemberships(c, student)).member["cs-society"]).toBeUndefined();

    await core.requestMembership(c, student, "cs-society", "I build things");
    expect((await core.myMemberships(c, student)).pending["cs-society"]).toBeTruthy();
    const queue = await core.orgRequests(c, leader);
    const mine = queue.find((r) => r.name === student.name)!;
    expect(mine.reason).toBe("I build things");

    await core.resolveMembershipRequest(c, leader, mine.id, true);
    const after = await core.myMemberships(c, student);
    expect(after.member["cs-society"]).toBeTruthy();
    expect(after.pending["cs-society"]).toBeUndefined();
    expect((await core.orgMembers(c, leader)).some((m) => m.email === student.email)).toBe(true);
  });

  it("only lets the org's own leader (or an admin) resolve requests", async () => {
    const student = await signIn("student@um.edu.ph", "student123");
    const leader = await signIn("leader@um.edu.ph", "leader123");
    await core.requestMembership(c, student, "eco-warriors"); // already a member: no-op
    await core.requestMembership(c, student, "volunteer-corps");
    const pendingRow = await c.execute({ sql: "SELECT id FROM membership_requests WHERE org_slug = 'volunteer-corps' AND user_id = ?", args: [student.id] });
    const id = String(pendingRow.rows[0].id);
    await expect(core.resolveMembershipRequest(c, leader, id, true)).rejects.toThrow("your own organization");
    await expect(core.resolveMembershipRequest(c, student, id, true)).rejects.toThrow(core.UserError);
    const admin = await signIn("admin1@um.edu.ph", "admin1123");
    await core.resolveMembershipRequest(c, admin, id, false);
    expect((await core.myMemberships(c, student)).pending["volunteer-corps"]).toBeUndefined();
  });

  it("lets only students request, and only real orgs", async () => {
    const leader = await signIn("leader@um.edu.ph", "leader123");
    const student = await signIn("student@um.edu.ph", "student123");
    await expect(core.requestMembership(c, leader, "eco-warriors")).rejects.toThrow("Only student accounts");
    await expect(core.requestMembership(c, student, "no-such-org")).rejects.toThrow("doesn't exist");
  });

  it("lets the leader manage the roster, but not remove themselves", async () => {
    const leader = await signIn("leader@um.edu.ph", "leader123");
    const roster = await core.orgMembers(c, leader);
    expect(roster.map((m) => m.name)).toContain("Anna Sy");
    await core.setMemberStatus(c, leader, "anna.sy@umindanao.edu.ph", "Inactive");
    expect((await core.orgMembers(c, leader)).find((m) => m.name === "Anna Sy")?.status).toBe("Inactive");
    await core.removeOrgMember(c, leader, "karl.m@umindanao.edu.ph");
    expect((await core.orgMembers(c, leader)).some((m) => m.name === "Karl Mendez")).toBe(false);
    await expect(core.removeOrgMember(c, leader, "nobody@umindanao.edu.ph")).rejects.toThrow(core.UserError);
  });

  it("seeds demo roster members who cannot sign in", async () => {
    expect((await core.authenticate(c, "anna.sy@umindanao.edu.ph", "", "1.1.1.1")).ok).toBe(false);
    const leader = await signIn("leader@um.edu.ph", "leader123");
    expect(await reload(leader)).toMatchObject({ role: "leader" });
  });
});
