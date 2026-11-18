import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdviserNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/adviser/notifications")({
  component: () => (
    <NotificationsView
      role="adviser"
      sub="Workflow updates, revision requests, and member activity alerts."
      resolveHref={resolveAdviserNotificationHref}
    />
  ),
});
