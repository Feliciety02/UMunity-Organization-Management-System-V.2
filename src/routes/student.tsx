import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type NavItem, type Notif } from "@/components/dashboard/DashboardLayout";
import type { BottomNavItem } from "@/components/dashboard/MobileBottomNav";
import { Home, Compass, Users, Calendar, Bell, User, Bookmark, MessageSquare, Grid2x2, Trophy, Settings, LifeBuoy, CalendarDays } from "lucide-react";
import { resolveStudentNotificationHref } from "@/lib/notifications";

const nav: NavItem[] = [
  { to: "/student", label: "Home Feed", icon: Home, section: "Student" },
  { to: "/student/explore", label: "Explore", icon: Compass, section: "Student" },
  { to: "/student/my-orgs", label: "My Organizations", icon: Users, badge: "3", section: "Student" },
  { to: "/student/events", label: "Events", icon: Calendar, section: "Student" },
  { to: "/student/saved", label: "Saved", icon: Bookmark, section: "Student" },
  { to: "/student/notifications", label: "Notifications", icon: Bell, badge: "4", section: "Student" },
  { to: "/student/messages", label: "Messages", icon: MessageSquare, badge: "2", section: "Student" },
  { to: "/student/profile", label: "Profile", icon: User, section: "Student" },
  { to: "/student/categories", label: "Categories", icon: Grid2x2, section: "Discover" },
  { to: "/student/top-organizations", label: "Top Organizations", icon: Trophy, section: "Discover" },
  { to: "/student/top-events", label: "Top Events", icon: CalendarDays, section: "Discover" },
  { to: "/student/help", label: "Help", icon: LifeBuoy, section: "Support" },
  { to: "/student/settings", label: "Settings", icon: Settings, section: "Support" },
];

const bottomNav: BottomNavItem[] = [
  { to: "/student", label: "Home", icon: Home },
  { to: "/student/explore", label: "Explore", icon: Compass },
  { to: "/student/events", label: "Events", icon: Calendar },
  { to: "/student/notifications", label: "Alerts", icon: Bell, badge: "4" },
  { to: "/student/profile", label: "Me", icon: User },
];

export const notifs: Notif[] = [
  { title: "Marvin Lim commented on your post", meta: "30m ago · Comment", unread: true },
  { title: "UM CS Society pinned a new announcement", meta: "2h ago · Organization", unread: true },
  { title: "Innovation Summit RSVP confirmed", meta: "4h ago · Event", unread: true },
  { title: "New announcement from UM Eco Warriors", meta: "Yesterday", unread: true },
  { title: "Welcome to UMunity", meta: "3 days ago", unread: false },
];

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardLayout role="student" nav={nav} notifs={notifs} resolveNotifHref={resolveStudentNotificationHref} bottomNav={bottomNav}>
      <Outlet />
    </DashboardLayout>
  ),
});
