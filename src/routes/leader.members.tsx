import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";
import { Search, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/leader/members")({
  component: Members,
});

const members = [
  { n: "Anna Sy", r: "Officer · VP", e: "anna.sy@umindanao.edu.ph", joined: "Mar 2024", status: "Active", c: "from-amber-500 to-primary" },
  { n: "Karl Mendez", r: "Officer · Sec", e: "karl.m@umindanao.edu.ph", joined: "Mar 2024", status: "Active", c: "from-rose-400 to-primary" },
  { n: "Pia Lim", r: "Officer · PRO", e: "pia.lim@umindanao.edu.ph", joined: "Apr 2024", status: "Active", c: "from-emerald-400 to-primary-deep" },
  { n: "Jules Tan", r: "Officer · Treas", e: "jules.t@umindanao.edu.ph", joined: "Apr 2024", status: "Active", c: "from-primary to-primary-deep" },
  { n: "Althea Dumaguete", r: "Member", e: "althea.d@umindanao.edu.ph", joined: "Mar 2026", status: "Active", c: "from-rose-400 to-primary" },
  { n: "Renz Aquino", r: "Member", e: "renz.a@umindanao.edu.ph", joined: "Feb 2026", status: "Inactive", c: "from-amber-500 to-primary" },
  { n: "Mia Cruz", r: "Member", e: "mia.c@umindanao.edu.ph", joined: "Jan 2026", status: "Active", c: "from-primary-deep to-rose-700" },
];

function Members() {
  const [q, setQ] = useState("");
  const filtered = members.filter((m) => m.n.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Manage members" sub="412 members across the organization." action={<button className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-primary-deep">Export CSV</button>} />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search members..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <select className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
            <option>All roles</option><option>Officers</option><option>Members</option>
          </select>
          <select className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold focus:outline-none">
            <option>All statuses</option><option>Active</option><option>Inactive</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Member</th><th>Role</th><th>Joined</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.n} className="transition hover:bg-secondary/40">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.n} color={m.c} />
                      <div>
                        <p className="font-semibold">{m.n}</p>
                        <p className="text-xs text-muted-foreground">{m.e}</p>
                      </div>
                    </div>
                  </td>
                  <td>{m.r}</td>
                  <td className="text-muted-foreground">{m.joined}</td>
                  <td><Badge tone={m.status === "Active" ? "success" : "neutral"}>{m.status}</Badge></td>
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
