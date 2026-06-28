import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";
import { MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: ManageUsers,
});

type User = {
  n: string;
  e: string;
  r: string;
  s: string;
  c: string;
  join: string;
};

const users: User[] = [
  { n: "Althea Dumaguete", e: "althea.d@umindanao.edu.ph", r: "Student", s: "Active", c: "from-rose-400 to-primary", join: "Mar 2026" },
  { n: "Marco Reyes", e: "marco.r@umindanao.edu.ph", r: "Leader", s: "Active", c: "from-primary to-primary", join: "Mar 2024" },
  { n: "Dr. Liana Kintanar", e: "liana.k@umindanao.edu.ph", r: "Admin", s: "Active", c: "from-primary-deep to-rose-700", join: "Aug 2022" },
  { n: "Jana Cruz", e: "jana.c@umindanao.edu.ph", r: "Student", s: "Pending", c: "from-emerald-400 to-primary", join: "May 2026" },
  { n: "Renz Aquino", e: "renz.a@umindanao.edu.ph", r: "Student", s: "Suspended", c: "from-primary to-primary", join: "Feb 2026" },
  { n: "Anna Sy", e: "anna.sy@umindanao.edu.ph", r: "Leader", s: "Active", c: "from-rose-400 to-primary", join: "Mar 2024" },
  { n: "Prof. Tan", e: "prof.tan@umindanao.edu.ph", r: "Adviser", s: "Active", c: "from-primary to-primary-deep", join: "Jun 2021" },
];

const columns: Column<User>[] = [
  {
    key: "name",
    label: "User",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.n} color={row.c} />
        <div>
          <p className="font-semibold">{row.n}</p>
          <p className="text-xs text-muted-foreground">{row.e}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    render: (row) => <Badge tone={row.r === "Admin" ? "gold" : row.r === "Leader" ? "warning" : "info"}>{row.r}</Badge>,
  },
  { key: "join", label: "Joined", sortable: true, render: (row) => <span className="text-muted-foreground">{row.join}</span> },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => <DataTableStatusBadge status={row.s} />,
  },
  {
    key: "actions",
    label: "",
    render: () => (
      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    ),
  },
];

function ManageUsers() {
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = roleFilter || statusFilter
    ? users.filter((u) => (!roleFilter || u.r === roleFilter) && (!statusFilter || u.s === statusFilter))
    : users;

  return (
    <>
      <PageHead title="Manage users" sub="18,412 total accounts across the platform." action={<button className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-primary-deep">+ Invite user</button>} />

      <Panel>
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.e}
          searchable
          searchPlaceholder="Search users..."
          pageSize={10}
          filters={
            <>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
              >
                <option value="">All roles</option>
                <option value="Student">Student</option>
                <option value="Leader">Leader</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
              >
                <option value="">All statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </>
          }
        />
      </Panel>
    </>
  );
}
