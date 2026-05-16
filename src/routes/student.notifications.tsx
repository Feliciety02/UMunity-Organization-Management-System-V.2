import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";
import { resolveStudentNotificationHref } from "@/lib/notifications";

export const Route = createFileRoute("/student/notifications")({
  component: () => <NotificationsView resolveHref={resolveStudentNotificationHref} />,
});
