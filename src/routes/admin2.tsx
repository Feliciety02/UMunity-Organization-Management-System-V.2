import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveAdmin2NotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

const notifs: Notif[] = [
  {
    title: "Hack Night is ready for Admin 2 compliance review",
    meta: "Queue update",
    unread: true,
  },
  {
    title: "Cultural Night moved to Admin 1 after your approval",
    meta: "Yesterday",
    unread: false,
  },
];

export const Route = createFileRoute("/admin2")({
  component: () => (
    <DashboardLayout
      role="admin2"
      nav={ROLE_NAV.admin2}
      notifs={notifs}
      resolveNotifHref={resolveAdmin2NotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin2}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
