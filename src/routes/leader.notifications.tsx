import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveLeaderNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/leader/notifications")({
  component: () => (
    <NotificationsView
      title="Inbox"
      sub="Membership requests, comments, and event activity for your org."
      resolveHref={resolveLeaderNotificationHref}
    />
  ),
});
