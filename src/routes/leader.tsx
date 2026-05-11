import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, UserPlus, CalendarPlus, Calendar, Megaphone, CheckSquare, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/leader", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leader/organization", label: "My Organization", icon: Building2 },
  { to: "/leader/members", label: "Manage Members", icon: Users },
  { to: "/leader/requests", label: "Membership Requests", icon: UserPlus, badge: "12" },
  { to: "/leader/create-event", label: "Create Event", icon: CalendarPlus },
  { to: "/leader/manage-events", label: "Manage Events", icon: Calendar },
  { to: "/leader/announcements", label: "Announcements", icon: Megaphone },
  { to: "/leader/attendance", label: "Attendance", icon: CheckSquare },
  { to: "/leader/profile", label: "Profile Settings", icon: Settings },
];

export const notifs: Notif[] = [
  { title: "12 new membership requests pending review", meta: "1h ago", unread: true },
  { title: "Innovation Summit has 184 RSVPs", meta: "3h ago", unread: true },
  { title: "Treasurer published a new budget update", meta: "Yesterday", unread: true },
  { title: "Monthly engagement report ready", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/leader")({
  component: () => (
    <DashboardLayout role="leader" nav={nav} notifs={notifs}>
      <Outlet />
    </DashboardLayout>
  ),
});
