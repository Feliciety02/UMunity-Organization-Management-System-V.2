import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHead, Panel, Avatar } from "@/components/dashboard/DashboardLayout";
import { MoreHorizontal } from "lucide-react";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";

export const Route = createFileRoute("/leader/members")({
  component: Members,
});

type MemberRow = {
  key: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: string;
  avatarColor: string;
};

const members = [
  { n: "Anna Sy", r: "Officer · VP", e: "anna.sy@umindanao.edu.ph", joined: "Mar 2024", status: "Active", c: "from-amber-500 to-primary" },
  { n: "Karl Mendez", r: "Officer · Sec", e: "karl.m@umindanao.edu.ph", joined: "Mar 2024", status: "Active", c: "from-rose-400 to-primary" },
  { n: "Jaymark Burlado", r: "Member", e: "jaymark.burlado@umindanao.edu.ph", joined: "Apr 2024", status: "Active", c: "from-emerald-400 to-primary-deep" },
];

const columns: Column<MemberRow>[] = [
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
  {
    key: "role",
    label: "Role",
    sortable: true,
    render: (row) => row.role,
  },
  {
    key: "joined",
    label: "Joined",
    sortable: true,
    render: (row) => <span className="text-muted-foreground">{row.joined}</span>,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => <DataTableStatusBadge status={row.status} />,
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

function Members() {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (q && !m.n.toLowerCase().includes(q.toLowerCase())) return false;
      if (roleFilter === "officers" && !m.r.toLowerCase().includes("officer")) return false;
      if (roleFilter === "members" && m.r.toLowerCase().includes("officer")) return false;
      if (statusFilter === "inactive" && m.status !== "Active") return false;
      return true;
    });
  }, [q, roleFilter, statusFilter]);

  const rows: MemberRow[] = useMemo(() => filtered.map((m) => ({
    key: m.n,
    name: m.n,
    email: m.e,
    role: m.r,
    joined: m.joined,
    status: m.status,
    avatarColor: m.c,
  })), [filtered]);

  return (
    <>
      <PageHead title="Manage members" sub="3 members across the organization." action={<button className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-primary-deep">Export CSV</button>} />

      <Panel>
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.key}
          searchable
          searchQuery={q}
          onSearchChange={setQ}
          searchPlaceholder="Search members..."
          filters={
            <>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
                <option value="all">All roles</option><option value="officers">Officers</option><option value="members">Members</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
                <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </>
          }
        />
      </Panel>
    </>
  );
}
