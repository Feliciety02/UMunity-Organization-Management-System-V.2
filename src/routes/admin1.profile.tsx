import { createFileRoute } from "@tanstack/react-router";
import { StaffProfilePage } from "@/components/profile/StaffProfilePage";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin1/profile")({
  component: Admin1Profile,
});

function Admin1Profile() {
  const s = getSession();
  return (
    <StaffProfilePage
      role="admin1"
      sub="Your Admin 1 identity, governance controls, and final authority preferences."
      panelTitle="Admin 1 profile"
      badges={[
        { label: "Final authority", tone: "gold" },
        { label: "Governance controls enabled", tone: "success" },
      ]}
      fields={[
        { label: "Full name", value: s?.name ?? "", editable: true },
        { label: "Email", value: s?.email ?? "" },
        { label: "Department", value: "Office of Student Affairs" },
        { label: "Role", value: "Admin 1" },
        { label: "Scope", value: "University-wide governance and final approvals" },
        { label: "Phone", value: "+63 917 000 0000", editable: true },
      ]}
    />
  );
}
