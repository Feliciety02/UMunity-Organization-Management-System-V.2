import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdmin2NotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/admin2/notifications")({
  component: Admin2Notifications,
});

function Admin2Notifications() {
  return (
    <NotificationsView
      title="Admin 2 notifications"
      sub="Compliance updates and secondary approval alerts."
      resolveHref={resolveAdmin2NotificationHref}
    />
  );
}
