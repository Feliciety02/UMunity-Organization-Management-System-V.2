import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";

export const Route = createFileRoute("/student/notifications")({
  component: () => <NotificationsView />,
});
