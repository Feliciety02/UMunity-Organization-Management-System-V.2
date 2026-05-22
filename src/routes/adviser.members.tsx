import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { useAdviserInsights } from "@/lib/adviser-insights";

export const Route = createFileRoute("/adviser/members")({
  component: AdviserMembers,
});

function AdviserMembers() {
  const session = getSession();
  const { memberActivity } = useAdviserInsights(session?.org);

  return (
    <>
      <PageHead title="Member activity" sub="See who is contributing to submissions, planning, and event readiness." />
      <Panel>
        <div className="space-y-3">
          {memberActivity.length === 0 ? (
            <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No leader activity has been recorded for this organization yet.</div>
          ) : memberActivity.map((item) => (
            <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-secondary/35 p-3">
              <Avatar name={item.name} color="from-sky-500 to-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone="info">{item.status}</Badge>
                <p className="text-[11px] text-muted-foreground">{item.contributions} updates</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
