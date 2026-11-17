// Client auth helpers. Accounts and sessions live in the database (see api.functions.ts);
// the demo accounts below are seeded into it in development (see db.server.ts).
import { loginFn, logoutFn, meFn, registerFn, type LoginResult } from "@/lib/api.functions";
import { clearSyncedCache, flushPending, syncFromServer } from "@/lib/cloud-storage";

export type Role = "student" | "leader" | "adviser" | "admin2" | "admin1" | "admin";

export type DemoUser = {
  email: string;
  password: string;
  role: Role;
  name: string;
  program?: string;
  org?: string;
  avatarColor: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    email: "student@um.edu.ph",
    password: "student123",
    role: "student",
    name: "Althea Dumaguete",
    program: "BS Computer Science - 3rd Year",
    avatarColor: "from-rose-400 to-primary",
  },
  {
    email: "leader@um.edu.ph",
    password: "leader123",
    role: "leader",
    name: "Marco Reyes",
    program: "President - UM CS Society",
    org: "UM Computer Studies Society",
    avatarColor: "from-primary to-primary",
  },
  {
    email: "adviser@um.edu.ph",
    password: "adviser123",
    role: "adviser",
    name: "Prof. Elena Tan",
    program: "Organization Adviser - UM CS Society",
    org: "UM Computer Studies Society",
    avatarColor: "from-sky-500 to-primary",
  },
  {
    email: "admin2@um.edu.ph",
    password: "admin2123",
    role: "admin2",
    name: "Dr. Miguel Soriano",
    program: "OSA Compliance Officer",
    avatarColor: "from-violet-500 to-primary",
  },
  {
    email: "admin1@um.edu.ph",
    password: "admin1123",
    role: "admin1",
    name: "Dr. Liana Kintanar",
    program: "Director of Student Affairs",
    avatarColor: "from-primary-deep to-rose-700",
  },
  {
    email: "admin@um.edu.ph",
    password: "admin123",
    role: "admin",
    name: "Legacy Admin",
    program: "Backward Compatibility Account",
    avatarColor: "from-primary-deep to-rose-700",
  },
];

const KEY = "umunity.auth";

/** What the browser knows about the signed-in user. The real session is an httpOnly cookie. */
export type Session = Omit<DemoUser, "password">;

function storeSession(session: Session, remember: boolean) {
  if (typeof window === "undefined") return;
  // "Remember me" keeps the session across browser restarts; otherwise it ends with the tab.
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
  (remember ? sessionStorage : localStorage).removeItem(KEY);
}

function clearLocalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}

export type { LoginResult };

export async function login(email: string, password: string, remember = true): Promise<LoginResult> {
  const result = await loginFn({ data: { email, password, remember } });
  if (result.ok) {
    clearSyncedCache();
    storeSession(result.session, remember);
  }
  return result;
}

/** Replace the browser's copy of the signed-in user (e.g. after changing the email). */
export function updateLocalSession(session: Session) {
  if (typeof window === "undefined") return;
  storeSession(session, localStorage.getItem(KEY) != null);
}

/** Forget the signed-in user locally (after the account is deleted on the server). */
export function forgetLocalSession() {
  clearLocalSession();
  clearSyncedCache();
}

export type RegisterResult = { ok: true; session: Session } | { ok: false; field: "email" | "form"; error: string };

export async function registerStudent(input: { name: string; email: string; program: string; password: string }): Promise<RegisterResult> {
  const result = await registerFn({ data: input });
  if (result.ok) {
    clearSyncedCache();
    storeSession(result.session, true);
  }
  return result;
}

export async function logout() {
  if (typeof window === "undefined") return;
  try {
    await flushPending();
    await logoutFn();
  } catch {
    // Signing out locally still matters if the server can't be reached.
  }
  clearLocalSession();
  clearSyncedCache();
}

/**
 * Check the session cookie with the server. Returns the user (refreshing the local copy)
 * or null, clearing local state, when the session has expired or was revoked.
 */
export async function verifySession(): Promise<Session | null> {
  const local = getSession();
  const remote = await meFn();
  if (!remote) {
    clearLocalSession();
    clearSyncedCache();
    return null;
  }
  if (!local || local.email !== remote.email) clearSyncedCache();
  const remember = typeof window !== "undefined" && localStorage.getItem(KEY) != null;
  storeSession(remote, remember || !local);
  return remote;
}

let ensuring: Promise<Session | null> | null = null;

/**
 * Confirm the session with the server and load the user's data from the database.
 * Concurrent callers share one request. If the server can't be reached, the cached
 * session is kept so a flaky connection doesn't sign anyone out.
 */
export function ensureSession(): Promise<Session | null> {
  ensuring ??= (async () => {
    let session: Session | null;
    try {
      session = await verifySession();
    } catch {
      return getSession();
    }
    if (session) await syncFromServer(session.role).catch((err) => console.warn("[UMunity] Couldn't load data from the database.", err));
    return session;
  })().finally(() => {
    ensuring = null;
  });
  return ensuring;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function homeFor(role: Role) {
  switch (role) {
    case "student":
      return "/student";
    case "leader":
      return "/leader";
    case "adviser":
      return "/adviser";
    case "admin2":
      return "/admin2";
    case "admin1":
      return "/admin1";
    default:
      return "/admin";
  }
}

export const ROLE_META: Record<Role, { label: string; accent: string; bg: string; ring: string }> = {
  student: {
    label: "Student",
    accent: "text-rose-600",
    bg: "from-rose-500 to-primary",
    ring: "ring-rose-200",
  },
  leader: {
    label: "Org Leader",
    accent: "text-primary",
    bg: "from-primary to-primary",
    ring: "ring-primary/30",
  },
  adviser: {
    label: "Adviser",
    accent: "text-sky-600",
    bg: "from-sky-500 to-primary",
    ring: "ring-sky-200",
  },
  admin2: {
    label: "Admin 2",
    accent: "text-violet-600",
    bg: "from-violet-500 to-primary",
    ring: "ring-violet-200",
  },
  admin1: {
    label: "Admin 1",
    accent: "text-primary",
    bg: "from-primary-deep to-rose-700",
    ring: "ring-primary/30",
  },
  admin: {
    label: "Admin",
    accent: "text-primary",
    bg: "from-primary-deep to-rose-700",
    ring: "ring-primary/30",
  },
};
