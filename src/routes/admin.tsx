import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveAdminNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const notifs: Notif[] = [
  { title: "9 reported posts awaiting moderation", meta: "20m ago - Moderation", unread: true },
  { title: "5 organizations awaiting verification", meta: "30m ago - Moderation", unread: true },
  { title: "Spike in event RSVPs this week (+24%)", meta: "2h ago - System", unread: true },
  { title: "New user signups today: 87", meta: "4h ago", unread: true },
  { title: "Weekly analytics report generated", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardLayout
      role="admin"
      nav={ROLE_NAV.admin}
      notifs={notifs}
      resolveNotifHref={resolveAdminNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
