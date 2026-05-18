import { createFileRoute, Link } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { AppButton } from "@/components/ui/app-button";
import { resolveLeaderNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/leader/notifications")({
  component: () => (
    <NotificationsView
      title="Inbox"
      sub="Membership requests, comments, and event activity for your org."
      resolveHref={resolveLeaderNotificationHref}
      emptyAction={
        <AppButton asChild variant="secondary" size="sm">
          <Link to="/leader/manage-events">Manage events</Link>
        </AppButton>
      }
    />
  ),
});
