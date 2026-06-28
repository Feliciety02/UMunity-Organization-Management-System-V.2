import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveAdmin1NotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

const notifs: Notif[] = [
  {
    title: "Cultural Night is ready for final approval",
    meta: "Pending final authority",
    unread: true,
  },
  { title: "Officer transition season starts next month", meta: "Governance", unread: false },
];

export const Route = createFileRoute("/admin1")({
  component: () => (
    <DashboardLayout
      role="admin1"
      nav={ROLE_NAV.admin1}
      notifs={notifs}
      resolveNotifHref={resolveAdmin1NotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin1}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
