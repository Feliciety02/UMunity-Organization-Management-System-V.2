import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveAdmin1NotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/admin1/notifications")({
  component: Admin1Notifications,
});

function Admin1Notifications() {
  return (
    <NotificationsView
      title="Admin 1 notifications"
      sub="Final authority approvals, governance prompts, and top-level workflow escalations."
      resolveHref={resolveAdmin1NotificationHref}
    />
  );
}
