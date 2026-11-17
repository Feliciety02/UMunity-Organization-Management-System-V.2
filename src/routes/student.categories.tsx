import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Grid2x2, Users } from "lucide-react";
import { PageHead, Panel, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { organizations } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";
import { getDiscoverableOrganizations } from "@/lib/org-discovery";
import { useOrgRegistry } from "@/lib/org-registry";

export const Route = createFileRoute("/student/categories")({
  component: Categories,
});

function Categories() {
  const loading = useDashboardPageLoading();
  const registry = useOrgRegistry();

  const categories = useMemo(() => {
    const orgs = getDiscoverableOrganizations(organizations, registry);
    const map = new Map<string, typeof orgs>();
    for (const org of orgs) map.set(org.category, [...(map.get(org.category) ?? []), org]);
    return [...map.entries()]
      .map(([name, list]) => ({ name, orgs: list, members: list.reduce((sum, o) => sum + o.members, 0) }))
      .sort((a, b) => b.orgs.length - a.orgs.length || a.name.localeCompare(b.name));
  }, [registry]);

  if (loading) {
    return (
      <>
        <PageHead title="Categories" sub="Loading interest areas." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PanelSkeleton key={i} rows={3} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Categories" sub="Browse organizations by interest area, advocacy, and campus focus." />

      {categories.length === 0 ? (
        <Panel>
          <EmptyState icon={Grid2x2} title="No categories yet" sub="Recognized organizations will be grouped here." />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/student/explore"
              search={{ category: c.name }}
              className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.orgs.length} {c.orgs.length === 1 ? "organization" : "organizations"} · {c.members.toLocaleString()} members
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="mt-4 flex -space-x-2">
                {c.orgs.slice(0, 4).map((o) => (
                  <div
                    key={o.slug}
                    title={o.name}
                    className={`grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-gradient-to-br ${o.color} text-[10px] font-bold text-primary-foreground`}
                  >
                    {o.initials}
                  </div>
                ))}
              </div>
              <p className="mt-4 line-clamp-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {c.orgs.map((o) => o.name.replace(/^UM /, "")).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
