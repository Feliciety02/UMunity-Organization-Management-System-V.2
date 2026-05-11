import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";
import { Search, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: ManageUsers,
});

const users = [
  { n: "Althea Dumaguete", e: "althea.d@umindanao.edu.ph", r: "Student", s: "Active", c: "from-rose-400 to-primary", join: "Mar 2026" },
  { n: "Marco Reyes", e: "marco.r@umindanao.edu.ph", r: "Leader", s: "Active", c: "from-amber-500 to-primary", join: "Mar 2024" },
  { n: "Dr. Liana Kintanar", e: "liana.k@umindanao.edu.ph", r: "Admin", s: "Active", c: "from-primary-deep to-rose-700", join: "Aug 2022" },
  { n: "Jana Cruz", e: "jana.c@umindanao.edu.ph", r: "Student", s: "Pending", c: "from-emerald-400 to-primary", join: "May 2026" },
  { n: "Renz Aquino", e: "renz.a@umindanao.edu.ph", r: "Student", s: "Suspended", c: "from-amber-500 to-primary", join: "Feb 2026" },
  { n: "Anna Sy", e: "anna.sy@umindanao.edu.ph", r: "Leader", s: "Active", c: "from-rose-400 to-primary", join: "Mar 2024" },
  { n: "Prof. Tan", e: "prof.tan@umindanao.edu.ph", r: "Adviser", s: "Active", c: "from-primary to-primary-deep", join: "Jun 2021" },
];

function ManageUsers() {
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => (u.n + u.e).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Manage users" sub="18,412 total accounts across the platform." action={<button className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-primary-deep">+ Invite user</button>} />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <select className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"><option>All roles</option><option>Student</option><option>Leader</option><option>Admin</option></select>
          <select className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"><option>All statuses</option><option>Active</option><option>Suspended</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">User</th><th>Role</th><th>Joined</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.e} className="hover:bg-secondary/40">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.n} color={u.c} />
                      <div><p className="font-semibold">{u.n}</p><p className="text-xs text-muted-foreground">{u.e}</p></div>
                    </div>
                  </td>
                  <td><Badge tone={u.r === "Admin" ? "gold" : u.r === "Leader" ? "warning" : "info"}>{u.r}</Badge></td>
                  <td className="text-muted-foreground">{u.join}</td>
                  <td><Badge tone={u.s === "Active" ? "success" : u.s === "Pending" ? "warning" : "danger"}>{u.s}</Badge></td>
                  <td><button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
