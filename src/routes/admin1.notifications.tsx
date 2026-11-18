import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdmin1NotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/admin1/notifications")({
  component: () => (
    <NotificationsView
      role="admin1"
      sub="Final authority approvals, governance prompts, and escalations."
      resolveHref={resolveAdmin1NotificationHref}
    />
  ),
});
