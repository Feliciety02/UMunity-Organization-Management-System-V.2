import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveStudentNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const notifs: Notif[] = [
  { title: "Marvin Lim commented on your post", meta: "30m ago · Comment", unread: true },
  { title: "UM CS Society pinned a new announcement", meta: "2h ago · Organization", unread: true },
  { title: "Innovation Summit RSVP confirmed", meta: "4h ago · Event", unread: true },
  { title: "New announcement from UM Eco Warriors", meta: "Yesterday", unread: true },
  { title: "Welcome to UMunity", meta: "3 days ago", unread: false },
];

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardLayout
      role="student"
      nav={ROLE_NAV.student}
      notifs={notifs}
      resolveNotifHref={resolveStudentNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.student}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
