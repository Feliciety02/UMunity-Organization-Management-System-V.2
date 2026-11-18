// Roles, the signed-in user's shape, and the demo accounts (seeded into the database in development).
// No imports on purpose: both browser code and server code (and tests) use this module.
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

/** What the browser knows about the signed-in user. The real session is an httpOnly cookie. */
export type Session = Omit<DemoUser, "password">;
