import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Compass, Users, Calendar, Bell, Settings } from "lucide-react";

const nav: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/explore", label: "Explore Orgs", icon: Compass },
  { to: "/student/my-orgs", label: "My Organizations", icon: Users, badge: "3" },
  { to: "/student/events", label: "Events", icon: Calendar },
  { to: "/student/notifications", label: "Notifications", icon: Bell, badge: "4" },
  { to: "/student/profile", label: "Profile Settings", icon: Settings },
];

export const notifs: Notif[] = [
  { title: "Your UM CS Society application was approved", meta: "2h ago · Organization", unread: true },
  { title: "Innovation Summit RSVP confirmed", meta: "4h ago · Event", unread: true },
  { title: "New announcement from UM Eco Warriors", meta: "Yesterday · Announcement", unread: true },
  { title: "Don't forget — Eco Run starts at 5:30 AM", meta: "Yesterday · Reminder", unread: true },
  { title: "Welcome to UMUnity 🎉", meta: "3 days ago", unread: false },
];

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardLayout role="student" nav={nav} notifs={notifs}>
      <Outlet />
    </DashboardLayout>
  ),
});
