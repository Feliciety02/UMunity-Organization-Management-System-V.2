import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShieldCheck,
  ScrollText,
  Bell,
  User,
} from "lucide-react";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import type { BottomNavItem } from "@/components/dashboard/MobileBottomNav";
import { resolveAdmin1NotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/admin1", label: "Dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
  { to: "/admin1/governance", label: "Governance", icon: ScrollText, section: "OVERVIEW" },
  { to: "/admin1/notifications", label: "Notifications", icon: Bell, section: "AUTHORITY" },
  { to: "/admin1/profile", label: "Profile", icon: User, section: "SETTINGS" },
];

const bottomNav: BottomNavItem[] = [
  { to: "/admin1", label: "Queue", icon: ShieldCheck },
  { to: "/admin1/governance", label: "Records", icon: ScrollText },
  { to: "/admin1/notifications", label: "Alerts", icon: Bell },
  { to: "/admin1/profile", label: "Me", icon: User },
];

const notifs: Notif[] = [
  { title: "Cultural Night is ready for final approval", meta: "Pending final authority", unread: true },
  { title: "Officer transition season starts next month", meta: "Governance", unread: false },
];

export const Route = createFileRoute("/admin1")({
  component: () => (
    <DashboardLayout role="admin1" nav={nav} notifs={notifs} resolveNotifHref={resolveAdmin1NotificationHref} bottomNav={bottomNav}>
      <Outlet />
    </DashboardLayout>
  ),
});
