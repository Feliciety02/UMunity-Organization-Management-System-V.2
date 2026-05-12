import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { Grid2x2 } from "lucide-react";

export const Route = createFileRoute("/student/categories")({
  component: () => (
    <SidebarPlaceholderPage
      title="Categories"
      sub="Browse organizations by interest area, advocacy, and campus focus."
      icon={Grid2x2}
      actionLabel="Explore organizations"
      actionTo="/student/explore"
    />
  ),
});
