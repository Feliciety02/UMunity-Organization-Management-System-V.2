import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout, type Notif } from "@/components/dashboard/DashboardLayout";
import { resolveLeaderNotificationHref } from "@/lib/notifications";
import { ROLE_BOTTOM_NAV, ROLE_NAV } from "@/lib/role-navigation";

export const notifs: Notif[] = [
  { title: "12 new membership requests pending review", meta: "1h ago", unread: true },
  { title: "8 new comments on your posts", meta: "2h ago", unread: true },
  { title: "Innovation Summit has 184 RSVPs", meta: "3h ago", unread: true },
  { title: "Treasurer published a new budget update", meta: "Yesterday", unread: true },
  { title: "Monthly engagement report ready", meta: "2 days ago", unread: false },
];

export const Route = createFileRoute("/leader")({
  component: () => (
    <DashboardLayout
      role="leader"
      nav={ROLE_NAV.leader}
      notifs={notifs}
      resolveNotifHref={resolveLeaderNotificationHref}
      bottomNav={ROLE_BOTTOM_NAV.leader}
    >
      <Outlet />
    </DashboardLayout>
  ),
});
