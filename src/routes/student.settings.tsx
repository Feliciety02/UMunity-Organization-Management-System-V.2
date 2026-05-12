import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/student/settings")({
  component: () => (
    <SidebarPlaceholderPage
      title="Settings"
      sub="Manage your student workspace preferences and notification defaults."
      icon={Settings}
      actionLabel="Open profile"
      actionTo="/student/profile"
    />
  ),
});
