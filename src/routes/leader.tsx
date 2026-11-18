import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveLeaderNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/leader")({
  component: () => (
    <DashboardLayout
      role="leader"
      nav={ROLE_NAV.leader}
      resolveNotifHref={resolveLeaderNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.leader}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
