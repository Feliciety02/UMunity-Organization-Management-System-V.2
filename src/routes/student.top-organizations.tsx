import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/student/top-organizations")({
  component: () => (
    <SidebarPlaceholderPage
      title="Top Organizations"
      sub="See the most active and most followed student communities on campus."
      icon={Trophy}
      actionLabel="Explore"
      actionTo="/student/explore"
    />
  ),
});
