import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { resolveStudentNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const Route = createFileRoute("/student")({
  component: () => (
    <DashboardLayout
      role="student"
      nav={ROLE_NAV.student}
      resolveNotifHref={resolveStudentNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.student}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
