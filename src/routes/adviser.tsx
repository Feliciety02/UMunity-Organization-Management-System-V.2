import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveAdviserNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

const notifs: Notif[] = [
  { title: "Innovation Summit is waiting for adviser review", meta: "Pending now", unread: true },
  { title: "Hack Night moved to Admin 2 after your approval", meta: "4h ago", unread: true },
  { title: "A leader responded to your revision note", meta: "Yesterday", unread: false },
];

export const Route = createFileRoute("/adviser")({
  component: () => (
    <DashboardLayout
      role="adviser"
      nav={ROLE_NAV.adviser}
      notifs={notifs}
      resolveNotifHref={resolveAdviserNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.adviser}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
