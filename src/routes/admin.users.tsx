import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";
import { UserPlus } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { RowActions } from "@/components/ui/row-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showStatusToast } from "@/lib/feedback";

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

const initialUsers: User[] = [
  {
    n: "Althea Dumaguete",
    e: "althea.d@umindanao.edu.ph",
    r: "Student",
    s: "Active",
    c: "from-rose-400 to-primary",
    join: "Mar 2026",
  },
  {
    n: "Marco Reyes",
    e: "marco.r@umindanao.edu.ph",
    r: "Leader",
    s: "Active",
    c: "from-primary to-primary",
    join: "Mar 2024",
  },
  {
    n: "Dr. Liana Kintanar",
    e: "liana.k@umindanao.edu.ph",
    r: "Admin",
    s: "Active",
    c: "from-primary-deep to-rose-700",
    join: "Aug 2022",
  },
  {
    n: "Jana Cruz",
    e: "jana.c@umindanao.edu.ph",
    r: "Student",
    s: "Pending",
    c: "from-emerald-400 to-primary",
    join: "May 2026",
  },
  {
    n: "Renz Aquino",
    e: "renz.a@umindanao.edu.ph",
    r: "Student",
    s: "Suspended",
    c: "from-primary to-primary",
    join: "Feb 2026",
  },
  {
    n: "Anna Sy",
    e: "anna.sy@umindanao.edu.ph",
    r: "Leader",
    s: "Active",
    c: "from-rose-400 to-primary",
    join: "Mar 2024",
  },
  {
    n: "Prof. Tan",
    e: "prof.tan@umindanao.edu.ph",
    r: "Adviser",
    s: "Active",
    c: "from-primary to-primary-deep",
    join: "Jun 2021",
  },
];

function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Student" });
  const inviteError = !invite.name.trim()
    ? "Enter a name."
    : !/^[^\s@]+@(umindanao\.edu\.ph|um\.edu\.ph)$/i.test(invite.email.trim())
      ? "Use a UM email address (@umindanao.edu.ph)."
      : "";
  const [inviteTouched, setInviteTouched] = useState(false);

  function setStatus(row: User, status: string) {
    setUsers((list) => list.map((u) => (u.e === row.e ? { ...u, s: status } : u)));
    showStatusToast(
      status === "Suspended" ? "User suspended" : "User activated",
      `${row.n} is now ${status.toLowerCase()}.`,
      status === "Suspended" ? "warning" : "success",
    );
  }

  function sendInvite() {
    setInviteTouched(true);
    if (inviteError) return;
    setUsers((list) => [
      {
        n: invite.name.trim(),
        e: invite.email.trim(),
        r: invite.role,
        s: "Pending",
        c: "from-primary to-primary-deep",
        join: "Just invited",
      },
      ...list,
    ]);
    showStatusToast("Invite sent", `${invite.email.trim()} will get a sign-up link.`);
    setInvite({ name: "", email: "", role: "Student" });
    setInviteTouched(false);
    setInviteOpen(false);
  }

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
      render: (row) => (
        <Badge tone={row.r === "Admin" ? "gold" : row.r === "Leader" ? "warning" : "info"}>
          {row.r}
        </Badge>
      ),
    },
    {
      key: "join",
      label: "Joined",
      sortable: true,
      render: (row) => <span className="text-muted-foreground">{row.join}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => <DataTableStatusBadge status={row.s} />,
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <RowActions
          label={`Actions for ${row.n}`}
          actions={[
            {
              label: "Email user",
              onSelect: () => {
                window.location.href = `mailto:${row.e}`;
              },
            },
            row.s === "Pending"
              ? { label: "Approve account", onSelect: () => setStatus(row, "Active") }
              : row.s === "Suspended"
                ? { label: "Reinstate", onSelect: () => setStatus(row, "Active") }
                : { label: "Suspend", danger: true, onSelect: () => setStatus(row, "Suspended") },
          ]}
        />
      ),
    },
  ];

  const filtered =
    roleFilter || statusFilter
      ? users.filter(
          (u) => (!roleFilter || u.r === roleFilter) && (!statusFilter || u.s === statusFilter),
        )
      : users;

  return (
    <>
      <PageHead
        title="Manage users"
        sub="18,412 total accounts across the platform."
        action={
          <AppButton variant="primary" size="md" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite user
          </AppButton>
        }
      />

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
                <option value="Adviser">Adviser</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
              >
                <option value="">All statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </>
          }
        />
      </Panel>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Invite a user</DialogTitle>
            <DialogDescription>They'll receive a sign-up link at their UM email.</DialogDescription>
          </DialogHeader>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              sendInvite();
            }}
            className="space-y-3"
          >
            <input
              value={invite.name}
              onChange={(e) => setInvite((v) => ({ ...v, name: e.target.value }))}
              placeholder="Full name"
              aria-label="Full name"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              value={invite.email}
              onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
              placeholder="name@umindanao.edu.ph"
              aria-label="UM email"
              type="email"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite((v) => ({ ...v, role: e.target.value }))}
              aria-label="Role"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <option>Student</option>
              <option>Leader</option>
              <option>Adviser</option>
              <option>Admin</option>
            </select>
            {inviteTouched && inviteError ? (
              <p className="text-xs text-destructive">{inviteError}</p>
            ) : null}
            <DialogFooter>
              <AppButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </AppButton>
              <AppButton type="submit" variant="primary" size="md">
                Send invite
              </AppButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
