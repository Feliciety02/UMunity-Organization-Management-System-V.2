import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Menu, PanelLeft, X, ChevronDown, LogOut, MessageSquare, Settings, User as UserIcon,
  Sparkles, type LucideIcon,
} from "lucide-react";
import { getSession, logout, ROLE_META, type Role } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

export type NavItem = { to: string; label: string; icon: LucideIcon; badge?: string; section?: string };

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== role) {
      navigate({ to: "/login" });
    } else {
      setSession(s);
    }
  }, [navigate, role]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px) and (max-width: 1279px)");
    const sync = () => setSidebarCollapsed(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!session) return null;

  const meta = ROLE_META[role];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-border bg-[#FEFDFE] md:flex ${sidebarCollapsed ? "w-20" : "w-[280px]"}`}>
        <SidebarInner role={role} nav={nav} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[calc(100vw-2rem)] flex-col border-r border-border bg-[#FEFDFE]">
            <div className="flex h-20 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-primary/6 hover:text-primary">
                  <X className="h-4 w-4" />
                </button>
                <Brand />
              </div>
            </div>
            <SidebarInner role={role} nav={nav} onNav={() => setMobileOpen(false)} hideBrand />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} session={session} notifs={notifs} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${meta.accent}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {meta.label} workspace
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <BrandLogo size={44} textClassName="text-base text-foreground" />
    </Link>
  );
}

const SIDEBAR_CTA: Record<Role, { title: string; text: string; button: string; to: string }> = {
  student: {
    title: "Join more organizations",
    text: "Discover communities that match your interests.",
    button: "Explore now",
    to: "/student/explore",
  },
  leader: {
    title: "Grow your organization",
    text: "Post updates and engage your members.",
    button: "Create post",
    to: "/leader/create-post",
  },
  admin: {
    title: "Review reports",
    text: "Check flagged posts and comments.",
    button: "Open moderation",
    to: "/admin/moderation",
  },
};

function SidebarInner({
  role,
  nav,
  onNav,
  hideBrand,
  collapsed = false,
  onToggleCollapse,
}: {
  role: Role;
  nav: NavItem[];
  onNav?: () => void;
  hideBrand?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const cta = SIDEBAR_CTA[role];

  const sections = nav.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "Workspace";
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!hideBrand && (
        <div className={`flex h-20 items-center border-b border-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
          <button
            onClick={onToggleCollapse}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-primary/6 hover:text-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          {!collapsed && <Brand />}
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto px-3 pb-6 ${hideBrand ? "pt-6" : "pt-8"}`}>
        {Object.entries(sections).map(([section, items]) => (
          <section key={section} className="mb-6 last:mb-0">
            {!collapsed && (
              <div className="mb-2.5 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {section}
              </div>
            )}
            <div className="space-y-2">
              {items.map((n) => {
                const active = n.to === "/" ? path === "/" : path === n.to || (n.to !== `/${role}` && path.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={onNav}
                    title={collapsed ? n.label : undefined}
                    className={`group relative flex h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[color:color-mix(in_oklab,var(--primary)_8%,white)] text-primary"
                        : "text-foreground/75 hover:bg-primary/6 hover:text-primary"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-primary" />}
                    <div className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                      <n.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                      {!collapsed && <span className="flex-1">{n.label}</span>}
                      {!collapsed && n.badge && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--gold)_28%,white)] px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                          {n.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-border px-4 py-4">
          <div className="rounded-2xl bg-card px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{cta.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{cta.text}</p>
              </div>
            </div>
            <Link
              to={cta.to}
              onClick={onNav}
              className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-primary-deep"
            >
              {cta.button}
            </Link>
          </div>
        </div>
      )}
    </div>
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
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border bg-[#FEFDFE] px-4 sm:px-6 lg:px-8">
      <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden">
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[520px]">
          <div className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-soft transition focus-within:border-primary focus-within:shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search UMUnity..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">Ctrl K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-muted-foreground transition hover:bg-secondary lg:inline-flex">
          <MessageSquare className="h-4 w-4" />
          Inbox
        </button>
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setOpenNotif(!openNotif); setOpenProf(false); }}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-border bg-background transition hover:bg-secondary"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">{unread}</span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 top-14 w-80 rounded-2xl border border-border bg-card p-2 shadow-soft">
              <div className="flex items-center justify-between p-2">
                <p className="font-display text-sm font-bold">Notifications</p>
                <span className="text-xs text-muted-foreground">{unread} new</span>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifs.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">You're all caught up</p>}
                {notifs.map((n, i) => (
                  <div key={i} className={`rounded-md p-3 text-sm transition hover:bg-secondary ${n.unread ? "bg-secondary/60" : ""}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
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
            className="flex items-center gap-3 rounded-full border border-border bg-background p-1 pr-4 transition hover:bg-secondary"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
              {session.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-foreground">{session.name.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground">{meta.label}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {openProf && (
            <div className="absolute right-0 top-12 w-64 rounded-3xl border border-border/70 bg-card p-2 shadow-soft">
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

export function PageHead({ title, sub, action, breadcrumbs }: { title: string; sub?: string; action?: React.ReactNode; breadcrumbs?: React.ReactNode }) {
  return (
    <div className="mb-8 space-y-4">
      {breadcrumbs && <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{breadcrumbs}</div>}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl font-bold tracking-tight leading-tight">{title}</h1>
          {sub && <p className="text-lg text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: { label: string; value: string; delta?: string; icon: LucideIcon; tone?: "primary" | "gold" | "rose" | "emerald" }) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/20 text-primary-deep",
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs font-medium text-emerald-600">{delta}</p>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-md ${toneCls}`}>
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {title && <h3 className="font-display text-base font-semibold">{title}</h3>}
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
    gold: "bg-gold/20 text-primary-deep",
  }[tone];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>{children}</span>;
}

export function MiniBarChart({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md"
            style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.85 }}
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
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#lg)" points={`0,100 ${pts} 100,100`} />
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function EmptyState({ title, sub, icon: Icon }: { title: string; sub?: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
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
