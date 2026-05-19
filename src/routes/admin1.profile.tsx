import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin1/profile")({
  component: Admin1Profile,
});

function Admin1Profile() {
  const s = getSession();
  return (
    <>
      <PageHead title="Profile settings" sub="Your Admin 1 identity, governance controls, and final authority preferences." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className={`grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${s?.avatarColor ?? "from-primary-deep to-rose-700"} text-2xl font-bold text-primary-foreground`}>
            {s?.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </div>
          <p className="mt-4 font-display text-lg font-bold">{s?.name}</p>
          <p className="text-sm text-muted-foreground">{s?.program}</p>
          <p className="mt-2 text-xs text-muted-foreground">{s?.email}</p>
          <div className="mt-4 space-y-2">
            <Badge tone="gold">Final authority</Badge>
            <Badge tone="success">Governance controls enabled</Badge>
          </div>
        </Panel>

        <Panel className="lg:col-span-2" title="Admin 1 profile">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Full name", s?.name ?? ""],
              ["Email", s?.email ?? ""],
              ["Department", "Office of Student Affairs"],
              ["Role", "Admin 1"],
              ["Scope", "University-wide governance and final approvals"],
              ["Last workflow action", "Today, 1:45 PM"],
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <input defaultValue={value} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground">Save changes</button>
        </Panel>
      </div>
    </>
  );
}
