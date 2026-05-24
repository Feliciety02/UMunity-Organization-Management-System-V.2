import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  Users,
  Bell,
  User,
  UserCog,
  Megaphone,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import type { BottomNavItem } from "@/components/dashboard/MobileBottomNav";
import { resolveAdviserNotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/adviser", label: "Dashboard", icon: LayoutDashboard, section: "WORKSPACE" },
  { to: "/adviser/transitions", label: "Officer Transitions", icon: UserCog, section: "WORKSPACE" },
  { to: "/adviser/posts", label: "Post Approvals", icon: Megaphone, section: "WORKSPACE" },
  { to: "/adviser/requirements", label: "Requirements", icon: ClipboardCheck, section: "WORKSPACE" },
  { to: "/adviser/compliance", label: "Accreditation", icon: ShieldCheck, section: "WORKSPACE" },
  { to: "/adviser/review-center", label: "Review Center", icon: MessageSquareText, section: "WORKSPACE" },
  { to: "/adviser/analytics", label: "Analytics", icon: BarChart3, section: "WORKSPACE" },
  { to: "/adviser/members", label: "Member activity", icon: Users, section: "WORKSPACE" },
  { to: "/adviser/notifications", label: "Notifications", icon: Bell, section: "REVIEW" },
  { to: "/adviser/profile", label: "Profile", icon: User, section: "SETTINGS" },
];

const bottomNav: BottomNavItem[] = [
  { to: "/adviser", label: "Queue", icon: ClipboardCheck },
  { to: "/adviser/review-center", label: "Review", icon: MessageSquareText },
  { to: "/adviser/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/adviser/notifications", label: "Alerts", icon: Bell },
  { to: "/adviser/profile", label: "Me", icon: User },
];

const notifs: Notif[] = [
  { title: "Innovation Summit is waiting for adviser review", meta: "Pending now", unread: true },
  { title: "Hack Night moved to Admin 2 after your approval", meta: "4h ago", unread: true },
  { title: "A leader responded to your revision note", meta: "Yesterday", unread: false },
];

export const Route = createFileRoute("/adviser")({
  component: () => (
    <DashboardLayout role="adviser" nav={nav} notifs={notifs} resolveNotifHref={resolveAdviserNotificationHref} bottomNav={bottomNav}>
      <Outlet />
    </DashboardLayout>
  ),
});
