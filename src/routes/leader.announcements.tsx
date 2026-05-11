import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Megaphone, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/leader/announcements")({
  component: Announcements,
});

const list = [
  { t: "Officer elections opening soon", body: "Filing of candidacy starts May 30. Submit forms via the portal.", time: "2h ago", reads: 312, likes: 48, tag: "Election" },
  { t: "Reminder: Submit committee reports", body: "All committee heads must submit their April reports by Friday.", time: "Yesterday", reads: 248, likes: 22, tag: "Reminder" },
  { t: "Welcome our new members 🎉", body: "24 new members joined this month. Make sure to greet them at the next gathering!", time: "3 days ago", reads: 410, likes: 96, tag: "Welcome" },
];

function Announcements() {
  return (
    <>
      <PageHead title="Announcements" sub="Broadcast updates to all 412 members." action={<button className="rounded-full bg-gradient-maroon px-5 py-2 text-xs font-semibold text-primary-foreground">+ New post</button>} />

      <Panel title="Compose new announcement" className="mb-6">
        <input placeholder="Headline..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        <textarea rows={3} placeholder="What's the update?" className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        <div className="mt-3 flex items-center justify-between">
          <select className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"><option>All members</option><option>Officers only</option></select>
          <button className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-primary-deep">Publish</button>
        </div>
      </Panel>

      <div className="grid gap-4">
        {list.map((a) => (
          <Panel key={a.t}>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-maroon text-gold"><Megaphone className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-bold">{a.t}</p>
                  <Badge tone="info">{a.tag}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
                <p className="mt-3 text-sm text-foreground/85">{a.body}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.reads}</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {a.likes}</span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
