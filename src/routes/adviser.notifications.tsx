import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdviserNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/adviser/notifications")({
  component: AdviserNotifications,
});

function AdviserNotifications() {
  return (
    <NotificationsView
      title="Adviser notifications"
      sub="Workflow updates, revision requests, and member activity alerts."
      resolveHref={resolveAdviserNotificationHref}
    />
  );
}
