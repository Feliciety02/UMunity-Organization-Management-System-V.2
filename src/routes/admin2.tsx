import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveAdmin2NotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/admin2")({
  component: () => (
    <DashboardLayout
      role="admin2"
      nav={ROLE_NAV.admin2}
      resolveNotifHref={resolveAdmin2NotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.admin2}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
