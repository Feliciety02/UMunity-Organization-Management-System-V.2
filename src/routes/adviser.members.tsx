import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge, Avatar } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/adviser/members")({
  component: AdviserMembers,
});

function AdviserMembers() {
  const activity = [
    { name: "Jana Cruz", detail: "Submitted program rationale edits", status: "Active" },
    { name: "Marvin Lim", detail: "Uploaded event budget revisions", status: "Contributing" },
    { name: "Anna Sy", detail: "Prepared committee attendance flow", status: "Preparing" },
  ];

  return (
    <>
      <PageHead title="Member activity" sub="See who is contributing to submissions, planning, and event readiness." />
      <Panel>
        <div className="space-y-3">
          {activity.map((item) => (
            <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-secondary/35 p-3">
              <Avatar name={item.name} color="from-sky-500 to-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Badge tone="info">{item.status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
