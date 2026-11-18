import { createFileRoute } from "@tanstack/react-router";
import { StaffProfilePage } from "@/components/profile/StaffProfilePage";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin2/profile")({
  component: Admin2Profile,
});

function Admin2Profile() {
  const s = getSession();
  return (
    <StaffProfilePage
      role="admin2"
      sub="Your Admin 2 review identity and compliance preferences."
      panelTitle="Admin 2 profile"
      badges={[
        { label: "Secondary review", tone: "warning" },
        { label: "Compliance queue active", tone: "success" },
      ]}
      fields={[
        { label: "Full name", value: s?.name ?? "", editable: true },
        { label: "Email", value: s?.email ?? "" },
        { label: "Department", value: "Office of Student Affairs" },
        { label: "Role", value: "Admin 2" },
        { label: "Review lane", value: "Compliance and monitoring" },
        { label: "Phone", value: "+63 917 000 0000", editable: true },
      ]}
    />
  );
}
