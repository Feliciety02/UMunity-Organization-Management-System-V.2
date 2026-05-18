import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import type { BottomNavItem } from "@/components/dashboard/MobileBottomNav";
import { LayoutDashboard, Users, Building2, Calendar, BarChart3, Megaphone, ScrollText, User, Flag, MessageSquare, ClipboardList } from "lucide-react";
import { resolveAdminNotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, section: "OVERVIEW" },
  { to: "/admin/reports", label: "Reports", icon: ClipboardList, section: "OVERVIEW" },
  { to: "/admin/users", label: "Users", icon: Users, section: "MANAGEMENT" },
  { to: "/admin/organizations", label: "Organizations", icon: Building2, badge: "5", section: "MANAGEMENT" },
  { to: "/admin/events", label: "Events", icon: Calendar, section: "MANAGEMENT" },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, section: "MANAGEMENT" },
  { to: "/admin/reported-posts", label: "Reported Posts", icon: Flag, badge: "4", section: "MODERATION" },
  { to: "/admin/reported-comments", label: "Reported Comments", icon: MessageSquare, badge: "5", section: "MODERATION" },
  { to: "/admin/logs", label: "Activity Logs", icon: ScrollText, section: "MODERATION" },
  { to: "/admin/profile", label: "Profile", icon: User, section: "SETTINGS" },
];

const bottomNav: BottomNavItem[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Stats", icon: BarChart3 },
  { to: "/admin/reported-posts", label: "Reports", icon: Flag, badge: "4" },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/profile", label: "Me", icon: User },
];

export const notifs: Notif[] = [
  { title: "9 reported posts awaiting moderation", meta: "20m ago - Moderation", unread: true },
  { title: "5 organizations awaiting verification", meta: "30m ago - Moderation", unread: true },
  { title: "Spike in event RSVPs this week (+24%)", meta: "2h ago - System", unread: true },
  { title: "New user signups today: 87", meta: "4h ago", unread: true },
  { title: "Weekly analytics report generated", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardLayout role="admin" nav={nav} notifs={notifs} resolveNotifHref={resolveAdminNotificationHref} bottomNav={bottomNav}>
      <Outlet />
    </DashboardLayout>
  ),
});
