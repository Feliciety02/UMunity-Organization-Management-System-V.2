import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PageHead, Panel, Avatar } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";
import { RowActions } from "@/components/ui/row-actions";
import { downloadCsv } from "@/lib/csv";
import { showStatusToast } from "@/lib/feedback";
import { removeOrgMember, setMemberStatus, useOrgMembers } from "@/lib/membership-requests";

export const Route = createFileRoute("/leader/members")({
  component: Members,
});

type Member = {
  name: string;
  email: string;
  role: string;
  joined: string;
  status: "Active" | "Inactive";
  avatarColor: string;
};

function Members() {
  // The roster lives in the database: demo officers plus students whose join requests were approved.
  const members: Member[] = useOrgMembers().map((m) => ({
    name: m.name,
    email: m.email,
    role: m.title,
    joined: m.since,
    status: m.status,
    avatarColor: m.avatarColor,
  }));
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [removing, setRemoving] = useState<Member | null>(null);

  const rows = useMemo(
    () =>
      members.filter((m) => {
        if (q && !`${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase())) return false;
        const officer = m.role.toLowerCase().includes("officer");
        if (roleFilter === "officers" && !officer) return false;
        if (roleFilter === "members" && officer) return false;
        if (statusFilter === "active" && m.status !== "Active") return false;
        if (statusFilter === "inactive" && m.status !== "Inactive") return false;
        return true;
      }),
    [members, q, roleFilter, statusFilter],
  );

  const setStatus = setMemberStatus;

  const columns: Column<Member>[] = [
    {
      key: "name",
      label: "Member",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} color={row.avatarColor} />
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", sortable: true, render: (row) => row.role },
    { key: "joined", label: "Joined", sortable: true, render: (row) => <span className="text-muted-foreground">{row.joined}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <DataTableStatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            {
              label: "Email member",
              onSelect: () => {
                window.location.href = `mailto:${row.email}`;
              },
            },
            row.status === "Active"
              ? {
                  label: "Mark inactive",
                  onSelect: () => {
                    setStatus(row.email, "Inactive");
                    showStatusToast("Member marked inactive", `${row.name} is now listed as inactive.`, "info");
                  },
                }
              : {
                  label: "Mark active",
                  onSelect: () => {
                    setStatus(row.email, "Active");
                    showStatusToast("Member reactivated", `${row.name} is active again.`);
                  },
                },
            { label: "Remove from org", danger: true, onSelect: () => setRemoving(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHead
        title="Manage members"
        sub={`${members.length} ${members.length === 1 ? "member" : "members"} across the organization.`}
        action={
          <AppButton
            variant="secondary"
            size="md"
            onClick={() =>
              downloadCsv(
                "umcss-members.csv",
                members.map((m) => ({ Name: m.name, Email: m.email, Role: m.role, Joined: m.joined, Status: m.status })),
              )
            }
          >
            <Download className="h-4 w-4" /> Export CSV
          </AppButton>
        }
      />

      <Panel>
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.email}
          searchable
          searchQuery={q}
          onSearchChange={setQ}
          searchPlaceholder="Search members..."
          filters={
            <>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role" className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
                <option value="all">All roles</option>
                <option value="officers">Officers</option>
                <option value="members">Members</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          }
        />
      </Panel>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "member"}?`}
        description="They'll lose access to members-only posts and events. They can request to join again later."
        confirmLabel="Remove member"
        tone="danger"
        onConfirm={() => {
          if (!removing) return;
          removeOrgMember(removing.email);
          showStatusToast("Member removed", `${removing.name} was removed from the organization.`, "warning");
          setRemoving(null);
        }}
      />
    </>
  );
}
