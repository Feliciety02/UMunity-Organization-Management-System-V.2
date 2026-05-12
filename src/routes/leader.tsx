import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, UserPlus, CalendarPlus, Calendar, Megaphone, PenSquare, MessageSquare, FileText, Settings, Eye } from "lucide-react";

const nav: NavItem[] = [
  { to: "/leader", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leader/organization", label: "Edit Organization", icon: Building2 },
  { to: "/leader/preview", label: "Public Preview", icon: Eye },
  { to: "/leader/create-post", label: "Create Post", icon: PenSquare },
  { to: "/leader/posts", label: "Manage Posts", icon: FileText },
  { to: "/leader/comments", label: "Comments", icon: MessageSquare, badge: "8" },
  { to: "/leader/members", label: "Members", icon: Users },
  { to: "/leader/requests", label: "Join Requests", icon: UserPlus, badge: "12" },
  { to: "/leader/create-event", label: "Create Event", icon: CalendarPlus },
  { to: "/leader/manage-events", label: "Manage Events", icon: Calendar },
  { to: "/leader/announcements", label: "Announcements", icon: Megaphone },
  { to: "/leader/profile", label: "Profile Settings", icon: Settings },
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
    <DashboardLayout role="leader" nav={nav} notifs={notifs}>
      <Outlet />
    </DashboardLayout>
  ),
});
