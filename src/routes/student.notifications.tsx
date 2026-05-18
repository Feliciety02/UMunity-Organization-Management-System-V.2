import { createFileRoute, Link } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { AppButton } from "@/components/ui/app-button";
import { resolveStudentNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/student/notifications")({
  component: () => (
    <NotificationsView
      resolveHref={resolveStudentNotificationHref}
      emptyAction={
        <AppButton asChild variant="secondary" size="sm">
          <Link to="/student/events">Browse events</Link>
        </AppButton>
      }
    />
  ),
});
