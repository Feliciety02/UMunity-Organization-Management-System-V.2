import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdminNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/admin/notifications")({
  component: () => (
    <NotificationsView
      role="admin"
      sub="Moderation queues, verification requests, and platform alerts."
      resolveHref={resolveAdminNotificationHref}
    />
  ),
});
