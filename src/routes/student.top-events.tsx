import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/student/top-events")({
  component: () => (
    <SidebarPlaceholderPage
      title="Top Events"
      sub="Track popular campus events with the strongest student interest."
      icon={CalendarDays}
      actionLabel="Open events"
      actionTo="/student/events"
    />
  ),
});
