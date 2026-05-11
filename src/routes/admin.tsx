import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, Building2, Calendar, BarChart3, Megaphone, ScrollText, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/organizations", label: "Manage Organizations", icon: Building2, badge: "5" },
  { to: "/admin/events", label: "Manage Events", icon: Calendar },
  { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/logs", label: "Activity Logs", icon: ScrollText },
  { to: "/admin/profile", label: "Profile Settings", icon: Settings },
];

export const notifs: Notif[] = [
  { title: "5 organizations awaiting verification", meta: "30m ago · Moderation", unread: true },
  { title: "Spike in event RSVPs this week (+24%)", meta: "2h ago · System", unread: true },
  { title: "New user signups today: 87", meta: "4h ago", unread: true },
  { title: "Flagged announcement requires review", meta: "Yesterday", unread: true },
  { title: "Weekly analytics report generated", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardLayout role="admin" nav={nav} notifs={notifs}>
      <Outlet />
    </DashboardLayout>
  ),
});
