// Server functions: the only way the browser talks to the database.
// Each handler runs on the server; the client gets a typed RPC stub. The logic lives in
// core.server.ts; these wrappers deal with cookies, the request and error shapes.
import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  getRequestIP,
  getRequestProtocol,
  getRequestUrl,
  setCookie,
} from "@tanstack/react-start/server";
import type { Session } from "@/lib/demo-users";
import * as core from "@/lib/core.server";
import * as finance from "@/lib/finance.server";
import { db, demoAccountsEnabled } from "@/lib/db.server";
import type { DocPatch } from "@/lib/synced-keys";

const COOKIE = "umunity_sid";

/** `code` tells the client how to recover: reload the latest version, or re-send the whole value. */
type Fail = { ok: false; error: string; code?: "conflict" | "reshape" };

/** Turns expected problems (UserError) into { ok: false, error } for the UI; real bugs still throw. */
async function attempt<T extends object>(fn: () => Promise<T>): Promise<({ ok: true } & T) | Fail> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (err) {
    if (err instanceof core.ConflictError)
      return { ok: false, error: err.message, code: "conflict" };
    if (err instanceof core.ReshapeError) return { ok: false, error: err.message, code: "reshape" };
    if (err instanceof core.UserError) return { ok: false, error: err.message };
    throw err;
  }
}

function setSessionCookie(token: string, ttlMs: number, remember: boolean) {
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestProtocol() === "https",
    path: "/",
    // Without "remember me" the cookie ends with the browser session.
    ...(remember ? { maxAge: ttlMs / 1000 } : {}),
  });
}

async function currentUser() {
  return core.userForToken(await db(), getCookie(COOKIE));
}

async function requireUser() {
  const user = await currentUser();
  if (!user) throw new core.UserError("Your session has ended. Sign in again.");
  return user;
}

/** Client IP for the sign-in throttle. Only trust proxy headers set by the platform itself. */
function clientIp() {
  return (
    getRequestHeader("cf-connecting-ip") ||
    getRequestIP({ xForwardedFor: Boolean(process.env.VERCEL) }) ||
    "unknown"
  );
}

// ---------- Config ----------

export const authConfigFn = createServerFn({ method: "GET" }).handler(async () => ({
  demoAccounts: demoAccountsEnabled(),
}));

// ---------- Auth ----------

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "locked"; retryAfterMs: number };

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string; remember: boolean }) => ({
    email: String(d.email ?? ""),
    password: String(d.password ?? ""),
    remember: Boolean(d.remember),
  }))
  .handler(async ({ data }): Promise<LoginResult> => {
    const c = await db();
    const result = await core.authenticate(c, data.email, data.password, clientIp());
    if (!result.ok) return result;
    const { token, ttl } = await core.createSession(c, result.user.id, data.remember);
    setSessionCookie(token, ttl, data.remember);
    return { ok: true, session: core.toSession(result.user) };
  });

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((d: core.RegisterInput) => d)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; session: Session } | { ok: false; field: "email" | "form"; error: string }
    > => {
      const c = await db();
      const result = await core.registerStudent(c, data);
      if (!result.ok) return result;
      const { token, ttl } = await core.createSession(c, result.user.id, true);
      setSessionCookie(token, ttl, true);
      return { ok: true, session: core.toSession(result.user) };
    },
  );

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie(COOKIE);
  if (token) await core.endSession(await db(), token);
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true };
});

export const meFn = createServerFn({ method: "GET" }).handler(async (): Promise<Session | null> => {
  const user = await currentUser();
  return user ? core.toSession(user) : null;
});

// ---------- Account management ----------

export const changePasswordFn = createServerFn({ method: "POST" })
  .inputValidator((d: { current: string; next: string }) => ({
    current: String(d.current ?? ""),
    next: String(d.next ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      await core.changePassword(await db(), user, data.current, data.next, getCookie(COOKIE));
      return {};
    }),
  );

export const changeEmailFn = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; email: string }) => ({
    password: String(d.password ?? ""),
    email: String(d.email ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      return { session: await core.changeEmail(await db(), user, data.password, data.email) };
    }),
  );

export const deleteAccountFn = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "") }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      await core.deleteAccount(await db(), user, data.password);
      deleteCookie(COOKIE, { path: "/" });
      return {};
    }),
  );

// ---------- Password reset ----------

async function sendResetEmail(to: string, name: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV !== "production")
      console.info(`[UMunity] Password reset link for ${to}: ${link}`);
    else
      console.warn(
        "[UMunity] RESEND_API_KEY / RESET_EMAIL_FROM not set; password reset email not sent.",
      );
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your UMunity password",
      text: `Hi ${name},\n\nUse this link to set a new UMunity password. It expires in 30 minutes and works once:\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    }),
  });
  if (!res.ok) console.error(`[UMunity] Resend rejected the reset email (${res.status}).`);
}

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => ({ email: String(d.email ?? "") }))
  .handler(async ({ data }): Promise<{ ok: true; devLink?: string }> => {
    const reset = await core.createPasswordReset(await db(), data.email);
    if (!reset) return { ok: true }; // same answer either way: don't reveal which emails have accounts
    // Links in emails must not come from the request's Host header (it can be forged), so
    // production needs APP_URL; development falls back to the current origin.
    const base =
      process.env.APP_URL || (process.env.NODE_ENV !== "production" ? getRequestUrl().origin : "");
    if (!base) {
      console.warn("[UMunity] APP_URL is not set; can't build a password reset link.");
      return { ok: true };
    }
    const link = `${base.replace(/\/$/, "")}/reset-password?token=${reset.token}`;
    await sendResetEmail(reset.user.email, reset.user.name, link);
    // In development without an email service, hand the link back so the flow can be tried.
    const devLink =
      process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY ? link : undefined;
    return { ok: true, devLink };
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; password: string }) => ({
    token: String(d.token ?? ""),
    password: String(d.password ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.resetPassword(await db(), data.token, data.password);
      return {};
    }),
  );

// ---------- App data ----------

export const loadDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  // Starting data for the approval stores; production starts them empty.
  const { SERVER_SEEDS } = await import("@/lib/seed-data");
  const seeds = demoAccountsEnabled()
    ? SERVER_SEEDS
    : Object.fromEntries(Object.keys(SERVER_SEEDS).map((k) => [k, () => []]));
  return core.loadData(await db(), user, seeds);
});

export const saveDataFn = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; value: string }) => ({
    key: String(d.key),
    value: String(d.value),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      return core.saveWhole(await db(), user, data.key, data.value);
    }),
  );

export const patchDataFn = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; patch: DocPatch }) => ({
    key: String(d.key),
    patch: {
      kind: d.patch?.kind,
      upserts: Array.isArray(d.patch?.upserts)
        ? d.patch.upserts.map((u) => ({
            k: String(u.k),
            v: String(u.v),
            pos: Number(u.pos) || 0,
            ver: Number(u.ver) || 0,
          }))
        : [],
      deletes: Array.isArray(d.patch?.deletes)
        ? d.patch.deletes.map((x) => ({ k: String(x.k), ver: Number(x.ver) || 0 }))
        : [],
    } as DocPatch,
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      return core.patchData(await db(), user, data.key, data.patch);
    }),
  );

// ---------- Memberships ----------

export const myMembershipsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return core.myMemberships(await db(), user);
});

export const requestMembershipFn = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string; reason?: string }) => ({
    slug: String(d.slug),
    reason: String(d.reason ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      const user = await requireUser();
      await core.requestMembership(await db(), user, data.slug, data.reason);
      return {};
    }),
  );

export const cancelMembershipRequestFn = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug) }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.cancelMembershipRequest(await db(), await requireUser(), data.slug);
      return {};
    }),
  );

export const leaveOrganizationFn = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug) }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.leaveOrganization(await db(), await requireUser(), data.slug);
      return {};
    }),
  );

export const orgRequestsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return core.orgRequests(await db(), user);
});

export const resolveMembershipRequestFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; approve: boolean }) => ({
    id: String(d.id),
    approve: Boolean(d.approve),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.resolveMembershipRequest(await db(), await requireUser(), data.id, data.approve);
      return {};
    }),
  );

export const orgMembersFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return core.orgMembers(await db(), user);
});

export const setMemberStatusFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; status: core.MemberStatus }) => ({
    email: String(d.email),
    status: d.status,
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.setMemberStatus(await db(), await requireUser(), data.email, data.status);
      return {};
    }),
  );

export const removeOrgMemberFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => ({ email: String(d.email) }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await core.removeOrgMember(await db(), await requireUser(), data.email);
      return {};
    }),
  );

// ---------- Finance ----------

async function financeDb() {
  const c = await db();
  await finance.ensureFinanceSchema(c);
  return c;
}

export const financeOrgsFn = createServerFn({ method: "GET" }).handler(async () =>
  finance.financeOrgs(await financeDb(), await requireUser()),
);

export const loadLedgerFn = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug) }))
  .handler(async ({ data }) =>
    attempt(async () => ({
      ledger: await finance.loadLedger(await financeDb(), await requireUser(), data.slug, {
        demo: demoAccountsEnabled(),
      }),
    })),
  );

export const recordEntryFn = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string; entry: finance.NewEntry }) => ({
    slug: String(d.slug),
    entry: {
      kind: d.entry?.kind,
      amountCents: Number(d.entry?.amountCents),
      category: String(d.entry?.category ?? ""),
      description: String(d.entry?.description ?? ""),
      occurredOn: String(d.entry?.occurredOn ?? ""),
      workflowId: d.entry?.workflowId ? String(d.entry.workflowId) : null,
      eventTitle: d.entry?.eventTitle ? String(d.entry.eventTitle) : null,
    } as finance.NewEntry,
  }))
  .handler(async ({ data }) =>
    attempt(async () =>
      finance.recordEntry(await financeDb(), await requireUser(), data.slug, data.entry),
    ),
  );

export const addReceiptFn = createServerFn({ method: "POST" })
  .inputValidator((d: { entryId: string; filename: string; dataBase64: string }) => ({
    entryId: String(d.entryId),
    filename: String(d.filename ?? ""),
    dataBase64: String(d.dataBase64 ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () =>
      finance.addReceipt(await financeDb(), await requireUser(), data.entryId, {
        filename: data.filename,
        dataBase64: data.dataBase64,
      }),
    ),
  );

export const removeReceiptFn = createServerFn({ method: "POST" })
  .inputValidator((d: { receiptId: string }) => ({ receiptId: String(d.receiptId) }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await finance.removeReceipt(await financeDb(), await requireUser(), data.receiptId);
      return {};
    }),
  );

export const getReceiptFn = createServerFn({ method: "GET" })
  .inputValidator((d: { receiptId: string }) => ({ receiptId: String(d.receiptId) }))
  .handler(async ({ data }) =>
    attempt(async () => finance.getReceipt(await financeDb(), await requireUser(), data.receiptId)),
  );

export const reviewEntryFn = createServerFn({ method: "POST" })
  .inputValidator((d: { entryId: string; decision: "verify" | "flag"; note: string }) => ({
    entryId: String(d.entryId),
    decision: d.decision === "flag" ? ("flag" as const) : ("verify" as const),
    note: String(d.note ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await finance.reviewEntry(
        await financeDb(),
        await requireUser(),
        data.entryId,
        data.decision,
        data.note,
      );
      return {};
    }),
  );

export const voidEntryFn = createServerFn({ method: "POST" })
  .inputValidator((d: { entryId: string; reason: string }) => ({
    entryId: String(d.entryId),
    reason: String(d.reason ?? ""),
  }))
  .handler(async ({ data }) =>
    attempt(async () => {
      await finance.voidEntry(await financeDb(), await requireUser(), data.entryId, data.reason);
      return {};
    }),
  );
