import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdmin2NotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/admin2/notifications")({
  component: () => (
    <NotificationsView
      role="admin2"
      sub="Compliance updates and secondary approval alerts."
      resolveHref={resolveAdmin2NotificationHref}
    />
  ),
});
