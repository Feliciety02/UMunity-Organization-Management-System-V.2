import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/leader/feed")({
  component: () => (
    <SidebarPlaceholderPage
      title="Organization Feed"
      sub="Review your organization's latest public posts and member-facing updates."
      icon={Newspaper}
      actionLabel="Create post"
      actionTo="/leader/create-post"
    />
  ),
});
