import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Eye, Heart, Megaphone, Send } from "lucide-react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { showStatusToast } from "@/lib/feedback";
import { organizations } from "@/data/site";

export const Route = createFileRoute("/leader/announcements")({
  component: Announcements,
});

type Announcement = {
  t: string;
  body: string;
  time: string;
  reads: number;
  likes: number;
  tag: string;
  audience: string;
};

const initial: Announcement[] = [
  {
    t: "Officer elections opening soon",
    body: "Filing of candidacy starts May 30. Submit forms via the portal.",
    time: "2h ago",
    reads: 312,
    likes: 48,
    tag: "Election",
    audience: "All members",
  },
  {
    t: "Reminder: Submit committee reports",
    body: "All committee heads must submit their April reports by Friday.",
    time: "Yesterday",
    reads: 248,
    likes: 22,
    tag: "Reminder",
    audience: "Officers only",
  },
  {
    t: "Welcome our new members 🎉",
    body: "New members joined this month. Make sure to greet them at the next gathering!",
    time: "3 days ago",
    reads: 410,
    likes: 96,
    tag: "Welcome",
    audience: "All members",
  },
];

function Announcements() {
  const [list, setList] = useState(initial);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All members");
  const [touched, setTouched] = useState(false);
  const headlineRef = useRef<HTMLInputElement>(null);
  const members = organizations.find((o) => o.slug === "cs-society")?.members ?? 0;
  const valid = headline.trim().length > 0 && body.trim().length > 0;

  function publish() {
    setTouched(true);
    if (!valid) return;
    setList((l) => [
      {
        t: headline.trim(),
        body: body.trim(),
        time: "Just now",
        reads: 0,
        likes: 0,
        tag: "Update",
        audience,
      },
      ...l,
    ]);
    setHeadline("");
    setBody("");
    setTouched(false);
    showStatusToast("Announcement published", `Sent to ${audience.toLowerCase()}.`);
  }

  return (
    <>
      <PageHead
        title="Announcements"
        sub={`Broadcast quick updates to all ${members} members. Longer posts go through Create Post.`}
        action={
          <AppButton variant="primary" size="md" onClick={() => headlineRef.current?.focus()}>
            <Megaphone className="h-4 w-4" /> New announcement
          </AppButton>
        }
      />

      <Panel title="Compose new announcement" className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
          noValidate
        >
          <input
            ref={headlineRef}
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
            placeholder="What's the update?"
            aria-label="Message"
            aria-invalid={touched && !body.trim()}
            className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
          />
          {touched && !valid ? (
            <p className="mt-1 text-xs text-destructive">
              Add a headline and a message before publishing.
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              aria-label="Audience"
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
            >
              <option>All members</option>
              <option>Officers only</option>
            </select>
            <AppButton type="submit" variant="primary" size="md">
              <Send className="h-4 w-4" /> Publish
            </AppButton>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4">
        {list.map((a, i) => (
          <Panel key={`${a.t}-${i}`}>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-bold">{a.t}</p>
                  <Badge tone="info">{a.tag}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.audience} · {a.time}
                </p>
                <p className="mt-3 text-sm text-foreground/85">{a.body}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {a.reads}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {a.likes}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
