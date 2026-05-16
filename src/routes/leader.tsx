import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, UserPlus, Calendar, PenSquare, MessageSquare, FileText, User, Eye, Newspaper, ClipboardList, Bell } from "lucide-react";
import { resolveLeaderNotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/leader", label: "Dashboard", icon: LayoutDashboard, section: "WORKSPACE" },
  { to: "/leader/feed", label: "Organization Feed", icon: Newspaper, section: "WORKSPACE" },
  { to: "/leader/preview", label: "Public Preview", icon: Eye, section: "WORKSPACE" },
  { to: "/leader/organization", label: "Edit Organization", icon: Building2, section: "MANAGEMENT" },
  { to: "/leader/members", label: "Members", icon: Users, section: "MANAGEMENT" },
  { to: "/leader/requests", label: "Membership Requests", icon: UserPlus, badge: "12", section: "MANAGEMENT" },
  { to: "/leader/manage-events", label: "Events", icon: Calendar, section: "MANAGEMENT" },
  { to: "/leader/attendees", label: "Attendees", icon: ClipboardList, section: "MANAGEMENT" },
  { to: "/leader/create-post", label: "Create Post", icon: PenSquare, section: "MANAGEMENT" },
  { to: "/leader/posts", label: "Manage Posts", icon: FileText, section: "MANAGEMENT" },
  { to: "/leader/comments", label: "Comments", icon: MessageSquare, badge: "8", section: "MANAGEMENT" },
  { to: "/leader/notifications", label: "Notifications", icon: Bell, section: "SETTINGS" },
  { to: "/leader/profile", label: "Profile", icon: User, section: "SETTINGS" },
];

export const notifs: Notif[] = [
  { title: "12 new membership requests pending review", meta: "1h ago", unread: true },
  { title: "8 new comments on your posts", meta: "2h ago", unread: true },
  { title: "Innovation Summit has 184 RSVPs", meta: "3h ago", unread: true },
  { title: "Treasurer published a new budget update", meta: "Yesterday", unread: true },
  { title: "Monthly engagement report ready", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/leader")({
  component: () => (
    <DashboardLayout role="leader" nav={nav} notifs={notifs} resolveNotifHref={resolveLeaderNotificationHref}>
      <Outlet />
    </DashboardLayout>
  ),
});
