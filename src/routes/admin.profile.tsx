import { createFileRoute } from "@tanstack/react-router";
import { StaffProfilePage } from "@/components/profile/StaffProfilePage";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin/profile")({
  component: Profile,
});

function Profile() {
  const s = getSession();
  return (
    <StaffProfilePage
      role="admin"
      sub="Your admin account details and security."
      panelTitle="Account"
      badges={[
        { label: "Super Admin", tone: "gold" },
        { label: "2FA enabled", tone: "success" },
      ]}
      fields={[
        { label: "Full name", value: s?.name ?? "", editable: true },
        { label: "Email", value: s?.email ?? "" },
        { label: "Role", value: "OSA Coordinator" },
        { label: "Department", value: "Office of Student Affairs" },
        { label: "Phone", value: "+63 917 000 0000", editable: true },
        { label: "Last login", value: "Today, 9:14 AM" },
      ]}
    />
  );
}
