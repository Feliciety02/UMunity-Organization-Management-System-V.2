// Simple client-side hardcoded auth (demo only)
export type Role = "student" | "leader" | "admin";

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
    avatarColor: "from-amber-500 to-primary",
  },
  {
    email: "admin@um.edu.ph",
    password: "admin123",
    role: "admin",
    name: "Dr. Liana Kintanar",
    program: "OSA Coordinator - UM",
    avatarColor: "from-primary-deep to-rose-700",
  },
];

const KEY = "umunity.auth";

export type Session = Omit<DemoUser, "password">;

export function login(email: string, password: string): Session | null {
  const u = DEMO_USERS.find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!u) return null;
  const { password: _, ...session } = u;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(session));
  }
  return session;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function homeFor(role: Role) {
  return role === "student" ? "/student" : role === "leader" ? "/leader" : "/admin";
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
    accent: "text-amber-600",
    bg: "from-amber-500 to-primary",
    ring: "ring-amber-200",
  },
  admin: {
    label: "Admin",
    accent: "text-primary",
    bg: "from-primary-deep to-rose-700",
    ring: "ring-primary/30",
  },
};
