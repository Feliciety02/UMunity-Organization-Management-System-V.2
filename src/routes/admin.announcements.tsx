import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Megaphone, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  return (
    <>
      <PageHead title="Global announcements" sub="Broadcast university-wide updates to all users." />

      <Panel title="Compose broadcast" className="mb-6">
        <input placeholder="Headline..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        <textarea rows={3} placeholder="Your message..." className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"><option>All users</option><option>Students only</option><option>Org leaders only</option></select>
          <select className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"><option>Normal priority</option><option>Important</option><option>Urgent</option></select>
          <button className="ml-auto rounded-full bg-gradient-maroon px-5 py-2 text-xs font-bold text-primary-foreground">Broadcast</button>
        </div>
      </Panel>

      <div className="grid gap-4">
        {[
          { t: "Maintenance window: May 18, 11 PM - 1 AM", body: "UMunity will undergo scheduled maintenance.", reach: "18.4K users", time: "1d ago", tag: "Urgent", tone: "danger" as const },
          { t: "New org applications now open", body: "Submit your organization charter via the new wizard.", reach: "All leaders", time: "3d ago", tag: "Important", tone: "warning" as const },
          { t: "Welcome week 2026 recap", body: "Thanks to all orgs who participated! Highlights inside.", reach: "All users", time: "1w ago", tag: "Update", tone: "info" as const },
        ].map((a) => (
          <Panel key={a.t}>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-maroon text-gold"><Megaphone className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-bold">{a.t}</p>
                  <Badge tone={a.tone}>{a.tag}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.reach} - {a.time}</p>
                <p className="mt-3 text-sm text-foreground/85">{a.body}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> 14,210 reads</span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
