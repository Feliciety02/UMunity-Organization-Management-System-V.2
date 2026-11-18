import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Megaphone, Send } from "lucide-react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
});

type Priority = "Normal" | "Important" | "Urgent";
type Broadcast = { t: string; body: string; reach: string; time: string; priority: Priority; reads: number };

const TONE: Record<Priority, "info" | "warning" | "danger"> = { Normal: "info", Important: "warning", Urgent: "danger" };

const initial: Broadcast[] = [
  { t: "Maintenance window: May 18, 11 PM - 1 AM", body: "UMunity will undergo scheduled maintenance.", reach: "All users", time: "1d ago", priority: "Urgent", reads: 14210 },
  { t: "New org applications now open", body: "Submit your organization charter via the new wizard.", reach: "Org leaders only", time: "3d ago", priority: "Important", reads: 412 },
  { t: "Welcome week 2026 recap", body: "Thanks to all orgs who participated! Highlights inside.", reach: "All users", time: "1w ago", priority: "Normal", reads: 9820 },
];

function AdminAnnouncements() {
  const [list, setList] = useState(initial);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [reach, setReach] = useState("All users");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [touched, setTouched] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const valid = headline.trim().length > 0 && body.trim().length > 0;

  function broadcast() {
    setList((l) => [{ t: headline.trim(), body: body.trim(), reach, time: "Just now", priority, reads: 0 }, ...l]);
    setHeadline("");
    setBody("");
    setTouched(false);
    showStatusToast("Broadcast sent", `Delivered to ${reach.toLowerCase()}.`);
  }

  return (
    <>
      <PageHead title="Global announcements" sub="Broadcast university-wide updates to all users." />

      <Panel title="Compose broadcast" className="mb-6">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (valid) setConfirming(true);
          }}
        >
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline..."
            aria-label="Headline"
            aria-invalid={touched && !headline.trim()}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
          />
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message..."
            aria-label="Message"
            aria-invalid={touched && !body.trim()}
            className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
          />
          {touched && !valid ? <p className="mt-1 text-xs text-destructive">Add a headline and a message before broadcasting.</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select value={reach} onChange={(e) => setReach(e.target.value)} aria-label="Audience" className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
              <option>All users</option>
              <option>Students only</option>
              <option>Org leaders only</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority" className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
              <option value="Normal">Normal priority</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
            </select>
            <AppButton type="submit" variant="primary" size="md" className="ml-auto">
              <Send className="h-4 w-4" /> Broadcast
            </AppButton>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4">
        {list.map((a, i) => (
          <Panel key={`${a.t}-${i}`}>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Megaphone className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-bold">{a.t}</p>
                  <Badge tone={TONE[a.priority]}>{a.priority}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.reach} · {a.time}</p>
                <p className="mt-3 text-sm text-foreground/85">{a.body}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.reads.toLocaleString()} reads</span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Send this broadcast?"
        description={`"${headline.trim()}" will be delivered to ${reach.toLowerCase()} as a ${priority.toLowerCase()} announcement.`}
        confirmLabel="Send broadcast"
        onConfirm={broadcast}
      />
    </>
  );
}
