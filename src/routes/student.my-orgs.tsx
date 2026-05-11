import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { organizations } from "@/data/site";
import { Users, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/student/my-orgs")({
  component: MyOrgs,
});

function MyOrgs() {
  const my = organizations.slice(0, 3);
  const pending = [{ name: "UM Debate Council", category: "Advocacy", color: "from-amber-500 to-primary" }];

  return (
    <>
      <PageHead title="My organizations" sub="The communities you belong to." />

      <div className="grid gap-4 lg:grid-cols-2">
        {my.map((o) => (
          <div key={o.name} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${o.color} font-display text-lg font-bold text-primary-foreground`}>
                {o.name.split(" ").filter((w) => w !== "UM").slice(0, 2).map((w) => w[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.category} · Member since Mar 2026</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="success">Active member</Badge>
                  <Badge>{o.members} members</Badge>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[["7","Events"],["12","Posts"],["3","Awards"]].map(([v,l]) => (
                <div key={l} className="rounded-xl bg-secondary/60 p-3">
                  <p className="font-display text-lg font-bold">{v}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-full bg-gradient-maroon py-2 text-xs font-semibold text-primary-foreground">View org</button>
              <button className="grid h-9 w-9 place-items-center rounded-full border border-border"><MessageSquare className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-full border border-border"><Users className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-display text-lg font-bold">Pending applications</h2>
      <Panel>
        {pending.map((o) => (
          <div key={o.name} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-3">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${o.color} text-xs font-bold text-primary-foreground`}>DC</div>
              <div>
                <p className="text-sm font-semibold">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.category}</p>
              </div>
            </div>
            <Badge tone="warning">Under review</Badge>
          </div>
        ))}
      </Panel>
    </>
  );
}
