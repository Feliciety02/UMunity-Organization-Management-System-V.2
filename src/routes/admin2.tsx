import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldCheck,
  Bell,
  User,
  Megaphone,
  Activity,
} from "lucide-react";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import type { BottomNavItem } from "@/components/dashboard/MobileBottomNav";
import { resolveAdmin2NotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/admin2", label: "Dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
  { to: "/admin2/monitoring", label: "Monitoring", icon: Activity, section: "OVERVIEW" },
  { to: "/admin2/compliance", label: "Compliance", icon: ShieldCheck, section: "OVERVIEW" },
  { to: "/admin2/requirements", label: "Requirements", icon: ClipboardCheck, section: "REVIEWS" },
  { to: "/admin2/posts", label: "Post Publishing", icon: Megaphone, section: "REVIEWS" },
  { to: "/admin2/notifications", label: "Notifications", icon: Bell, section: "REVIEWS" },
  { to: "/admin2/profile", label: "Profile", icon: User, section: "SETTINGS" },
];

const bottomNav: BottomNavItem[] = [
  { to: "/admin2", label: "Queue", icon: ClipboardCheck },
  { to: "/admin2/monitoring", label: "Monitor", icon: Activity },
  { to: "/admin2/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/admin2/notifications", label: "Alerts", icon: Bell },
  { to: "/admin2/profile", label: "Me", icon: User },
];

const notifs: Notif[] = [
  { title: "Hack Night is ready for Admin 2 compliance review", meta: "Queue update", unread: true },
  { title: "Cultural Night moved to Admin 1 after your approval", meta: "Yesterday", unread: false },
];

export const Route = createFileRoute("/admin2")({
  component: () => (
    <DashboardLayout role="admin2" nav={nav} notifs={notifs} resolveNotifHref={resolveAdmin2NotificationHref} bottomNav={bottomNav}>
      <Outlet />
    </DashboardLayout>
  ),
});
