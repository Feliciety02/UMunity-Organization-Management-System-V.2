import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { organizations } from "@/data/site";
import { CheckCircle2, X, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrgs,
});

const pending = [
  { n: "UM Drone Society", c: "Tech", who: "Aldous P.", submitted: "May 06" },
  { n: "UM AgriTech Hub", c: "Agriculture", who: "Liza M.", submitted: "May 04" },
  { n: "UM Game Dev Guild", c: "Tech", who: "Jared K.", submitted: "May 02" },
  { n: "UM Mental Wellness Circle", c: "Wellness", who: "Faye R.", submitted: "Apr 28" },
  { n: "UM Astronomy Club", c: "Science", who: "Rian C.", submitted: "Apr 25" },
];

function AdminOrgs() {
  return (
    <>
      <PageHead title="Manage organizations" sub="120 active · 5 pending verification" />

      <Panel title="Pending verification" className="mb-6">
        <div className="space-y-3">
          {pending.map((o) => (
            <div key={o.n} className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-maroon text-xs font-bold text-primary-foreground">{o.n.split(" ")[1][0]}{o.n.split(" ")[2]?.[0] ?? ""}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{o.n}</p>
                <p className="text-xs text-muted-foreground">{o.c} · submitted by {o.who} on {o.submitted}</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-full bg-gradient-maroon px-3 py-1.5 text-xs font-bold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> Review</button>
              <button className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"><X className="h-3.5 w-3.5" /> Reject</button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Active organizations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Organization</th><th>Category</th><th>Members</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((o) => (
                <tr key={o.name} className="hover:bg-secondary/40">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${o.color} text-xs font-bold text-primary-foreground`}>{o.name.split(" ").filter(w=>w!=="UM").slice(0,2).map(w=>w[0]).join("")}</div>
                      <span className="font-semibold">{o.name}</span>
                    </div>
                  </td>
                  <td>{o.category}</td>
                  <td>{o.members}</td>
                  <td><Badge tone="success">Recognized</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
