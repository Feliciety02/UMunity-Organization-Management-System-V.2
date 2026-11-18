import { createFileRoute } from "@tanstack/react-router";
import { StaffProfilePage } from "@/components/profile/StaffProfilePage";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/profile")({
  component: Profile,
});

function Profile() {
  const s = getSession();
  return (
    <StaffProfilePage
      role="leader"
      sub="Update your leader account details."
      panelTitle="Account"
      badges={[
        { label: "Organization role", tone: "gold" },
        { label: "Term until March 2027", tone: "info" },
      ]}
      fields={[
        { label: "Full name", value: s?.name ?? "", editable: true },
        { label: "UM Email", value: s?.email ?? "" },
        { label: "Organization", value: s?.org ?? "" },
        { label: "Position", value: "President" },
        { label: "Phone", value: "+63 917 000 0000", editable: true },
        { label: "Term until", value: "March 2027" },
      ]}
    />
  );
}
