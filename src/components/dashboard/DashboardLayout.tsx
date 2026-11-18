import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Bell, Menu, PanelLeft, X, ChevronDown, LogOut, MessageSquare, Search, Settings, User as UserIcon,
  Sparkles, type LucideIcon,
} from "lucide-react";
import { ensureSession, getSession, logout, ROLE_META, type Role } from "@/lib/auth";
import { markRead, unreadCount, useNotifications } from "@/lib/notifications";
import { useMembershipRequests } from "@/lib/membership-requests";
import { useMemberships } from "@/lib/memberships";
import { useThreads } from "@/lib/messages";
import { usePendingOrgs } from "@/lib/admin-queues";
import { BrandLogo } from "@/components/BrandLogo";
import { PageHeader } from "@/components/layout/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppCard, AppCardHeader } from "@/components/ui/app-card";
import { AppBadge } from "@/components/ui/app-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileBottomNav, type BottomNavItem } from "@/components/dashboard/MobileBottomNav";

export type NavItem = { to: string; label: string; icon: LucideIcon; badge?: string; section?: string };

/** Live counts for nav items whose numbers come from app state rather than static labels. */
function useLiveBadges(role: Role): Record<string, string | undefined> {
  const unread = unreadCount(useNotifications(role));
  const requests = useMembershipRequests().length;
  const memberships = Object.keys(useMemberships().member).length;
  const unreadThreads = useThreads().filter((t) => t.unread).length;
  const pendingOrgs = usePendingOrgs().length;
  const fmt = (n: number) => (n > 0 ? String(n) : undefined);
  return {
    [`/${role}/notifications`]: fmt(unread),
    "/leader/requests": fmt(requests),
    "/student/my-orgs": fmt(memberships),
    "/student/messages": fmt(unreadThreads),
    "/admin/organizations": fmt(pendingOrgs),
  };
}

const PROFILE_LINK: Record<Role, string> = {
  student: "/student/profile",
  leader: "/leader/profile",
  adviser: "/adviser/profile",
  admin2: "/admin2/profile",
  admin1: "/admin1/profile",
  admin: "/admin/profile",
};

export function DashboardLayout({
  role,
  nav,
  resolveNotifHref,
  bottomNav,
  children,
}: {
  role: Role;
  nav: NavItem[];
  resolveNotifHref?: (href?: string) => string | undefined;
  bottomNav?: BottomNavItem[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  // Read the session after mount: the server has no storage, so reading it during
  // render makes the server and client HTML disagree (hydration mismatch).
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const liveBadges = useLiveBadges(role);

  useEffect(() => {
    let cancelled = false;
    if (!getSession()) {
      navigate({ to: "/login" });
      return;
    }
    // Confirm the session cookie with the server and pull this account's data first,
    // so the page never flashes another account's or the seed data.
    void ensureSession().then((s) => {
      if (cancelled) return;
      if (!s || s.role !== role) navigate({ to: "/login" });
      else setSession(s);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, role]);

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-border/80 bg-card/95 backdrop-blur transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
          sidebarCollapsed ? "w-20" : "w-[280px]"
        }`}
      >
        <SidebarInner role={role} nav={nav} badges={liveBadges} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} />
      </aside>

      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 lg:hidden ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ease-out ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[280px] max-w-[calc(100vw-2rem)] flex-col border-r border-border/80 bg-card/98 shadow-[0_22px_60px_rgba(15,23,42,0.28)] backdrop-blur transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <div className="flex h-20 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-primary/6 hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
                <Brand />
              </div>
            </div>
            <SidebarInner role={role} nav={nav} badges={liveBadges} onNav={() => setMobileOpen(false)} hideBrand />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} nav={nav} session={session} resolveNotifHref={resolveNotifHref} onMenu={() => setMobileOpen(true)} />
        <main className={`flex-1 px-6 py-8 sm:px-8 lg:px-10 ${bottomNav ? "pb-24 lg:pb-8" : ""}`}>
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
      {bottomNav ? <MobileBottomNav items={bottomNav} badges={liveBadges} /> : null}
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
  adviser: {
    title: "Review active workflows",
    text: "Clear proposal blockers before they reach university review.",
    button: "Open queue",
    to: "/adviser",
  },
  admin2: {
    title: "Validate compliance",
    text: "Process adviser-cleared requests and keep records moving.",
    button: "Review queue",
    to: "/admin2",
  },
  admin1: {
    title: "Oversee final approvals",
    text: "Manage final authority decisions and yearly governance.",
    button: "Open command view",
    to: "/admin1",
  },
  admin: {
    title: "Review reports",
    text: "Check flagged posts and comments.",
    button: "Open reported posts",
    to: "/admin/reported-posts",
  },
};

function SidebarInner({
  role,
  nav,
  badges = {},
  onNav,
  hideBrand,
  collapsed = false,
  onToggleCollapse,
}: {
  role: Role;
  nav: NavItem[];
  badges?: Record<string, string | undefined>;
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
        <div
          className={`flex h-20 items-center border-b border-border/70 px-4 transition-[padding,gap,justify-content] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            collapsed ? "justify-center px-3" : "gap-3"
          }`}
        >
          <button
            onClick={onToggleCollapse}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border hover:bg-secondary hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
          <div
            className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              collapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-[220px] translate-x-0 opacity-100"
            }`}
          >
            {!collapsed && <Brand />}
          </div>
        </div>
      )}

      <nav
        className={`scrollbar-none flex-1 overflow-y-auto px-3 pb-6 pt-4 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hideBrand ? "pt-6" : "pt-8"
        }`}
      >
        {Object.entries(sections).map(([section, items]) => (
          <section key={section} className="mb-7 last:mb-0">
            <div
              className={`overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                collapsed ? "mb-0 max-h-0 -translate-y-1 opacity-0" : "mb-2.5 max-h-10 translate-y-0 opacity-100"
              }`}
            >
              <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                {section}
              </div>
            </div>
            <div className={`space-y-1.5 ${collapsed ? "flex flex-col items-center" : ""}`}>
              {items.map((n) => {
                const badge = n.to in badges ? badges[n.to] : n.badge;
                const active = n.to === "/" ? path === "/" : path === n.to || (n.to !== `/${role}` && path.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={onNav}
                    title={collapsed ? n.label : undefined}
                    className={`group relative flex items-center text-sm font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200 ${
                      collapsed
                        ? "h-12 w-12 justify-center rounded-2xl border px-0"
                        : "h-11 rounded-2xl border px-3"
                    } ${
                      active
                        ? "border-border bg-secondary text-foreground shadow-soft"
                        : "border-transparent text-foreground/72 hover:border-border/70 hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    <div className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                      <n.icon
                        className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span
                        className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          collapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-[160px] translate-x-0 opacity-100"
                        }`}
                      >
                        {n.label}
                      </span>
                      <span
                        className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          collapsed || !badge ? "max-w-0 translate-x-2 opacity-0" : "max-w-12 translate-x-0 opacity-100"
                        }`}
                      >
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {badge}
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div
        className={`overflow-hidden border-t border-border/70 transition-[max-height,opacity,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collapsed ? "max-h-0 px-4 py-0 opacity-0" : "max-h-48 px-4 py-4 opacity-100"
        }`}
      >
        {!collapsed && (
          <div className="rounded-3xl border border-border/70 bg-background/70 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{cta.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{cta.text}</p>
              </div>
            </div>
            <AppButton asChild variant="primary" size="sm" className="mt-4">
              <Link to={cta.to} onClick={onNav}>
                {cta.button}
              </Link>
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
}

function Topbar({
  role,
  nav,
  session,
  resolveNotifHref,
  onMenu,
}: {
  role: Role;
  nav: NavItem[];
  session: ReturnType<typeof getSession> & {};
  resolveNotifHref?: (href?: string) => string | undefined;
  onMenu: () => void;
}) {
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

  const displayNotifs = useNotifications(role);
  const unread = unreadCount(displayNotifs);
  const profileLink = PROFILE_LINK[role];
  const notificationsLink = `/${role}/notifications`;
  async function doLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6 lg:px-8">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
        <NavSearch nav={nav} />
        {role === "student" ? (
          <Link
            to="/student/messages"
            className="ml-auto hidden h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground/85 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Messages
          </Link>
        ) : null}
        <ThemeToggle className={role === "student" ? "ml-auto lg:ml-0" : "ml-auto"} />
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setOpenNotif(!openNotif); setOpenProf(false); }}
            aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
            aria-haspopup="menu"
            aria-expanded={openNotif}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-border bg-background transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 top-14 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-2 shadow-soft">
              <div className="flex items-center justify-between p-2">
                <p className="font-display text-sm font-bold">Notifications</p>
                <Link
                  to={notificationsLink as string}
                  onClick={() => setOpenNotif(false)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="scrollbar-none max-h-80 space-y-1 overflow-y-auto">
                {displayNotifs.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">You're all caught up</p>}
                {displayNotifs.slice(0, 8).map((n) => {
                  const content = (
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.meta}</p>
                      </div>
                    </div>
                  );
                  const cls = `block rounded-md p-3 text-sm transition hover:bg-secondary ${n.unread ? "bg-secondary/60" : ""}`;
                  const resolvedHref = resolveNotifHref?.(n.href) ?? n.href;
                  if (resolvedHref) {
                    return (
                      <Link
                        key={n.id}
                        to={resolvedHref as string}
                        onClick={() => { markRead(n.id); setOpenNotif(false); }}
                        className={cls}
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`${cls} w-full text-left`}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div ref={profRef} className="relative">
          <button
            onClick={() => { setOpenProf(!openProf); setOpenNotif(false); }}
            aria-label={`Account menu for ${session.name}`}
            aria-haspopup="menu"
            aria-expanded={openProf}
            className="flex items-center gap-3 rounded-full border border-border bg-background p-1 pr-4 transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <UserIcon className="h-4 w-4" /> {role === "student" ? "Profile" : "Profile & settings"}
                </Link>
                {role === "student" ? (
                  <Link to="/student/settings" onClick={() => setOpenProf(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                ) : null}
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

/** Quick jump: filters the current role's pages and navigates on select. */
function NavSearch({ nav }: { nav: NavItem[] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nav
      .filter((n) => n.label.toLowerCase().includes(q) || (n.section ?? "").toLowerCase().includes(q))
      .slice(0, 6);
  }, [nav, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(item: NavItem) {
    navigate({ to: item.to });
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative hidden w-full max-w-[360px] lg:block lg:max-w-[420px]">
      <div className="flex h-11 items-center gap-2.5 rounded-2xl border border-border bg-card/88 px-3.5 shadow-soft focus-within:border-primary">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter" && results[active]) go(results[active]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search pages"
          aria-label="Search pages"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-border bg-card p-1.5 shadow-soft">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No pages match "{query}".</p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.to}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                  i === active ? "bg-secondary text-foreground" : "text-foreground/80"
                }`}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.section ? (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.section}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------- Shared UI primitives ----------------------- */

export function PageHead({ title, sub, action, breadcrumbs }: { title: string; sub?: string; action?: React.ReactNode; breadcrumbs?: React.ReactNode }) {
  return <PageHeader title={title} sub={sub} action={action} breadcrumbs={breadcrumbs} />;
}

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: { label: string; value: string; delta?: string; icon: LucideIcon; tone?: "primary" | "gold" | "rose" | "emerald" }) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/20 text-primary-deep",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs font-medium text-muted-foreground">{delta}</p>}
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
    <AppCard className={`rounded-3xl ${className}`}>
      <AppCardHeader title={title} action={action} />
      {children}
    </AppCard>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold" }) {
  return <AppBadge tone={tone}>{children}</AppBadge>;
}

export function MiniBarChart({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
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

export const EmptyState = SharedEmptyState;

export function PanelSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <AppCard className={`rounded-3xl ${className}`}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}

export function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-primary-foreground`}>
      {name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
    </div>
  );
}
