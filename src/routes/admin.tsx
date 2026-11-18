import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveAdminNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardLayout
      role="admin"
      nav={ROLE_NAV.admin}
      resolveNotifHref={resolveAdminNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
