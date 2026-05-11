import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge, StatCard } from "@/components/dashboard/DashboardLayout";
import { Users, Calendar, Award, Heart } from "lucide-react";

export const Route = createFileRoute("/leader/organization")({
  component: Org,
});

function Org() {
  return (
    <>
      <PageHead title="My organization" sub="Manage UM Computer Studies Society profile and identity." action={<button className="rounded-full bg-gradient-maroon px-5 py-2 text-xs font-semibold text-primary-foreground">Save changes</button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-maroon">
            <div className="absolute inset-0 bg-hero opacity-50" />
          </div>
          <div className="-mt-10 flex items-end gap-4 px-2">
            <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary-deep font-display text-2xl font-bold text-primary-foreground shadow-soft">CS</div>
            <div className="pb-2">
              <p className="font-display text-xl font-bold">UM Computer Studies Society</p>
              <p className="text-sm text-muted-foreground">Academic · 412 members</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Org name</span><input defaultValue="UM Computer Studies Society" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span><input defaultValue="Academic" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" /></label>
            <label className="block md:col-span-2"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span><textarea rows={3} defaultValue="The home of CS innovators, hackers, and future tech leaders at UM." className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" /></label>
          </div>
        </Panel>

        <div className="space-y-4">
          <StatCard label="Members" value="412" icon={Users} tone="primary" />
          <StatCard label="Events hosted" value="38" icon={Calendar} tone="gold" />
          <StatCard label="Awards" value="6" icon={Award} tone="rose" />
          <StatCard label="Community love" value="98%" icon={Heart} tone="emerald" />
        </div>
      </div>

      <Panel title="Officers" className="mt-6">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "Marco Reyes", r: "President" },
            { n: "Anna Sy", r: "Vice President" },
            { n: "Karl Mendez", r: "Secretary" },
            { n: "Jules Tan", r: "Treasurer" },
            { n: "Pia Lim", r: "PRO" },
            { n: "Prof. Tan", r: "Adviser" },
          ].map((o) => (
            <div key={o.n} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-primary text-xs font-bold text-primary-foreground">{o.n.split(" ").map((w) => w[0]).join("")}</div>
              <div>
                <p className="text-sm font-semibold">{o.n}</p>
                <p className="text-xs text-muted-foreground">{o.r}</p>
              </div>
              <Badge tone="success" >Active</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
