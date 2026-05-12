import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import { Home, Compass, Users, Calendar, Bell, User, Bookmark } from "lucide-react";

const nav: NavItem[] = [
  { to: "/student", label: "Home Feed", icon: Home },
  { to: "/student/explore", label: "Explore Orgs", icon: Compass },
  { to: "/student/my-orgs", label: "My Organizations", icon: Users, badge: "3" },
  { to: "/student/events", label: "Events", icon: Calendar },
  { to: "/student/saved", label: "Saved", icon: Bookmark },
  { to: "/student/notifications", label: "Notifications", icon: Bell, badge: "4" },
  { to: "/student/profile", label: "My Profile", icon: User },
];

export const notifs: Notif[] = [
  { title: "Marvin Lim commented on your post", meta: "30m ago · Comment", unread: true },
  { title: "UM CS Society pinned a new announcement", meta: "2h ago · Organization", unread: true },
  { title: "Innovation Summit RSVP confirmed", meta: "4h ago · Event", unread: true },
  { title: "New announcement from UM Eco Warriors", meta: "Yesterday", unread: true },
  { title: "Welcome to UMUnity", meta: "3 days ago", unread: false },
];

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardLayout role="student" nav={nav} notifs={notifs}>
      <Outlet />
    </DashboardLayout>
  ),
});
