import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveAdviserNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/adviser")({
  component: () => (
    <DashboardLayout
      role="adviser"
      nav={ROLE_NAV.adviser}
      resolveNotifHref={resolveAdviserNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.adviser}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
