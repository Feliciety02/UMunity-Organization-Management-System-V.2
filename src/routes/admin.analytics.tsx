import { createFileRoute } from "@tanstack/react-router";
import { SidebarPlaceholderPage } from "@/components/dashboard/SidebarPlaceholderPage";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: () => (
    <SidebarPlaceholderPage
      title="Analytics"
      sub="Monitor platform trends, organization growth, and event engagement metrics."
      icon={BarChart3}
      actionLabel="Open reports"
      actionTo="/admin/reports"
    />
  ),
});
