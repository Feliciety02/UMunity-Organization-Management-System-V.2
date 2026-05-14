import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/components/dashboard/NotificationsView";

export const Route = createFileRoute("/leader/notifications")({
  component: () => (
    <NotificationsView title="Inbox" sub="Membership requests, comments, and event activity for your org." />
  ),
});
