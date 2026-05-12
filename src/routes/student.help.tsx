import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/student/help")({
  component: () => (
    <SidebarPlaceholderPage
      title="Help"
      sub="Get support for account access, organizations, events, and campus activity."
      icon={LifeBuoy}
    />
  ),
});
