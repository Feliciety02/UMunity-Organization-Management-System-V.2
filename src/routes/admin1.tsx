import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveAdmin1NotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/admin1")({
  component: () => (
    <DashboardLayout
      role="admin1"
      nav={ROLE_NAV.admin1}
      resolveNotifHref={resolveAdmin1NotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin1}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
