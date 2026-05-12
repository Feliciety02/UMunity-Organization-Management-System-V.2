import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/student/messages")({
  component: () => (
    <SidebarPlaceholderPage
      title="Messages"
      sub="Direct conversations and organization inbox threads will appear here."
      icon={MessageSquare}
      actionLabel="View notifications"
      actionTo="/student/notifications"
    />
  ),
});
