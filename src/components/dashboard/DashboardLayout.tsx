import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Menu, X, ChevronDown, LogOut, Settings, User as UserIcon,
  Sparkles, type LucideIcon,
} from "lucide-react";
import { getSession, logout, ROLE_META, type Role } from "@/lib/auth";

export type NavItem = { to: string; label: string; icon: LucideIcon; badge?: string };

export type Notif = { title: string; meta: string; unread?: boolean };

export function DashboardLayout({
  role,
  nav,
  notifs,
  children,
}: {
  role: Role;
  nav: NavItem[];
  notifs: Notif[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== role) {
      navigate({ to: "/login" });
    } else {
      setSession(s);
    }
  }, [navigate, role]);

  if (!session) return null;

  const meta = ROLE_META[role];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <SidebarInner role={role} nav={nav} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between p-4">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarInner role={role} nav={nav} onNav={() => setMobileOpen(false)} hideBrand />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} session={session} notifs={notifs} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className={`mb-5 inline-flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.accent}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {meta.label} Workspace
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary">
        <Sparkles className="h-4 w-4 text-gold" />
      </div>
      <span className="font-display text-base font-bold">
        UM<span className="text-primary">Unity</span>
      </span>
    </Link>
  );
}

function SidebarInner({ role, nav, onNav, hideBrand }: { role: Role; nav: NavItem[]; onNav?: () => void; hideBrand?: boolean }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const meta = ROLE_META[role];

  return (
    <>
      {!hideBrand && (
        <div className="border-b border-border p-4">
          <Brand />
        </div>
      )}

      <div className="px-3 pb-2 pt-4">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${meta.accent}`}>{meta.label}</p>
        <p className="mt-0.5 font-display text-sm font-semibold text-foreground">Workspace</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {nav.map((n) => {
          const active = path === n.to || (n.to !== `/${role}` && path.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNav}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <n.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Back to website
        </Link>
      </div>
    </>
  );
}

function Topbar({ role, session, notifs, onMenu }: { role: Role; session: ReturnType<typeof getSession> & {}; notifs: Notif[]; onMenu: () => void }) {
  const navigate = useNavigate();
  const meta = ROLE_META[role];
  const [openNotif, setOpenNotif] = useState(false);
  const [openProf, setOpenProf] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpenNotif(false);
      if (profRef.current && !profRef.current.contains(e.target as Node)) setOpenProf(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unread = notifs.filter((n) => n.unread).length;
  const profileLink = `/${role}/profile`;

  function doLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden">
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex max-w-md flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 transition focus-within:border-primary">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search UMUnity..."
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
      </div>

      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setOpenNotif(!openNotif); setOpenProf(false); }}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card transition hover:border-primary"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-gold text-[10px] font-bold text-primary-deep">{unread}</span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-card p-2 shadow-glow">
              <div className="flex items-center justify-between p-2">
                <p className="font-display text-sm font-bold">Notifications</p>
                <span className="text-xs text-muted-foreground">{unread} new</span>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifs.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">You're all caught up ✨</p>}
                {notifs.map((n, i) => (
                  <div key={i} className={`rounded-xl p-3 text-sm transition hover:bg-secondary ${n.unread ? "bg-secondary/60" : ""}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-gold" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.meta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={profRef} className="relative">
          <button
            onClick={() => { setOpenProf(!openProf); setOpenNotif(false); }}
            className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition hover:border-primary"
          >
            <div className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${session.avatarColor} font-display text-xs font-bold text-primary-foreground`}>
              {session.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </div>
            <span className="hidden text-sm font-semibold sm:block">{session.name.split(" ")[0]}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {openProf && (
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-border bg-card p-2 shadow-glow">
              <div className="rounded-xl bg-secondary p-3">
                <p className="font-display text-sm font-bold">{session.name}</p>
                <p className="text-xs text-muted-foreground">{session.email}</p>
                <span className={`mt-2 inline-block rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.accent}`}>
                  {meta.label}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                <Link to={profileLink} onClick={() => setOpenProf(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <Link to={profileLink} onClick={() => setOpenProf(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ----------------------- Shared UI primitives ----------------------- */

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: { label: string; value: string; delta?: string; icon: LucideIcon; tone?: "primary" | "gold" | "rose" | "emerald" }) {
  const toneCls = {
    primary: "bg-gradient-maroon text-gold",
    gold: "bg-gradient-gold text-primary-deep",
    rose: "bg-gradient-to-br from-rose-500 to-primary text-white",
    emerald: "bg-gradient-to-br from-emerald-500 to-primary-deep text-white",
  }[tone];
  return (
    <div className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs font-medium text-emerald-600">{delta}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${toneCls}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-5 shadow-soft ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-display text-base font-bold">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold" }) {
  const cls = {
    neutral: "bg-secondary text-foreground",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
    gold: "bg-gradient-gold text-primary-deep",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>{children}</span>;
}

export function MiniBarChart({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-lg transition group-hover:opacity-80"
            style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(180deg, ${color}, color-mix(in oklab, ${color} 60%, transparent))` }}
          />
        </div>
      ))}
    </div>
  );
}

export function LineSpark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#lg)" points={`0,100 ${pts} 100,100`} />
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function EmptyState({ title, sub, icon: Icon }: { title: string; sub?: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/40 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-maroon text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-base font-bold">{title}</p>
      {sub && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-primary-foreground`}>
      {name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
    </div>
  );
}
