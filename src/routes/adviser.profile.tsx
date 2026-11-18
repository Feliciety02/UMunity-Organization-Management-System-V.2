import { createFileRoute } from "@tanstack/react-router";
import { StaffProfilePage } from "@/components/profile/StaffProfilePage";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/adviser/profile")({
  component: AdviserProfile,
});

function AdviserProfile() {
  const s = getSession();
  return (
    <StaffProfilePage
      role="adviser"
      sub="Your adviser account and review preferences."
      panelTitle="Adviser profile"
      badges={[
        { label: "First approval layer", tone: "info" },
        { label: "Workflow comments enabled", tone: "success" },
      ]}
      fields={[
        { label: "Full name", value: s?.name ?? "", editable: true },
        { label: "Email", value: s?.email ?? "" },
        { label: "Organization", value: s?.org ?? "" },
        { label: "Role", value: "Organization Adviser" },
        { label: "Review hours", value: "Weekdays, 8:00 AM - 5:00 PM", editable: true },
        { label: "Phone", value: "+63 917 000 0000", editable: true },
      ]}
    />
  );
}
