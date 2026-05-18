import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/admin/logs")({
  component: Logs,
});

const logs = [
  { a: "user.signup", who: "jana.c@umindanao.edu.ph", d: "Account created", time: "2 min ago", t: "info" as const },
  { a: "org.approved", who: "admin@um.edu.ph", d: "Approved 'UM Drone Society'", time: "32 min ago", t: "success" as const },
  { a: "event.published", who: "marco.r@umindanao.edu.ph", d: "Created 'Hack Night Vol. 3'", time: "1h ago", t: "info" as const },
  { a: "moderation.flag", who: "system", d: "Flagged announcement (Travel Society)", time: "2h ago", t: "warning" as const },
  { a: "user.suspended", who: "admin@um.edu.ph", d: "Suspended renz.a@umindanao.edu.ph", time: "4h ago", t: "danger" as const },
  { a: "backup.complete", who: "system", d: "Daily backup finished (3.2 GB)", time: "5h ago", t: "neutral" as const },
  { a: "announcement.sent", who: "admin@um.edu.ph", d: "Sent broadcast to 18.4K users", time: "Yesterday", t: "info" as const },
  { a: "org.created", who: "liza.m@umindanao.edu.ph", d: "Submitted 'UM AgriTech Hub' for review", time: "2 days ago", t: "info" as const },
];

function Logs() {
  return (
    <>
      <PageHead title="Activity logs" sub="Every important action across the platform." action={<button className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">Filter</button>} />

      <Panel>
        <div className="space-y-2">
          {logs.map((l, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-secondary/40 px-4 py-3 text-sm">
              <Badge tone={l.t}>{l.a}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate"><span className="font-mono text-xs text-muted-foreground">{l.who}</span> - {l.d}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{l.time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
