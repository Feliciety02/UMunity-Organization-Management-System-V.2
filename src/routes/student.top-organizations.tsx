import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trophy, Users } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { JoinOrgButton } from "@/components/org/JoinOrgButton";
import { OrgAvatar } from "@/components/social/PostCard";
import { organizations } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";
import { getDiscoverableOrganizations } from "@/lib/org-discovery";
import { useOrgRegistry } from "@/lib/org-registry";

export const Route = createFileRoute("/student/top-organizations")({
  component: TopOrganizations,
});

function TopOrganizations() {
  const loading = useDashboardPageLoading();
  const registry = useOrgRegistry();
  const ranked = useMemo(
    () => getDiscoverableOrganizations(organizations, registry).sort((a, b) => b.members - a.members),
    [registry],
  );

  if (loading) {
    return (
      <>
        <PageHead title="Top Organizations" sub="Ranking campus communities." />
        <PanelSkeleton rows={8} />
      </>
    );
  }

  return (
    <>
      <PageHead title="Top Organizations" sub="The most followed student communities on campus, ranked by membership." />
      <Panel>
        {ranked.length === 0 ? (
          <EmptyState icon={Trophy} title="No rankings yet" sub="Recognized organizations will appear here." />
        ) : (
          <ol className="divide-y divide-border">
            {ranked.map((o, i) => (
              <li key={o.slug} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${
                    i < 3 ? "bg-gold/25 text-primary-deep" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <OrgAvatar org={o} size={44} />
                <div className="min-w-0 flex-1">
                  <Link to="/student/org/$slug" params={{ slug: o.slug }} className="font-semibold hover:underline">
                    {o.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge tone="gold">{o.category}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {o.members.toLocaleString()} members
                    </span>
                  </div>
                </div>
                <JoinOrgButton slug={o.slug} orgName={o.name} size="sm" />
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
