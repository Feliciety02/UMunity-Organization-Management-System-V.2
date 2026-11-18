import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flag, MessageSquare, Reply, Send, Trash2 } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/leader/comments")({
  component: Comments,
});

type Item = { id: string; author: string; program: string; post: string; text: string; time: string; flagged?: boolean; reply?: string };

const initial: Item[] = [
  { id: "c1", author: "Jana Cruz", program: "BS IT - 2nd Yr", post: "Innovation Summit 2026 - Registration Open", text: "Sulit 'to last year, joining again!", time: "1h" },
  { id: "c2", author: "Marvin Lim", program: "BS CS - 1st Yr", post: "Innovation Summit 2026 - Registration Open", text: "Will the workshop tracks have certificates?", time: "30m", flagged: true },
  { id: "c3", author: "Ria Santos", program: "BS IS - 3rd Yr", post: "Officer elections opening soon", text: "Where can I read the candidate platforms?", time: "5h" },
  { id: "c4", author: "Karl Mendez", program: "BS CS - 4th Yr", post: "Hack Night Vol. 3", text: "Can we bring our own laptops?", time: "1d" },
];

function Comments() {
  const [items, setItems] = useState(initial);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [removing, setRemoving] = useState<Item | null>(null);

  function sendReply(id: string) {
    if (!draft.trim()) return;
    setItems((list) => list.map((c) => (c.id === id ? { ...c, reply: draft.trim() } : c)));
    setDraft("");
    setReplyingTo(null);
    showStatusToast("Reply sent", "Your response has been added to the thread.");
  }

  return (
    <>
      <PageHead title="Comments" sub="Reply to, report, or remove comments on your organization's posts." />
      <Panel>
        {items.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No comments to review" sub="New comments on your posts will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {items.map((c) => (
              <div key={c.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary-deep">
                  {c.author.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{c.author}</p>
                    <span className="text-xs text-muted-foreground">· {c.program}</span>
                    {c.flagged && <Badge tone="warning">Reported</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    on <span className="font-medium text-foreground">{c.post}</span> · {c.time}
                  </p>
                  <p className="mt-1.5 text-sm">{c.text}</p>
                  {c.reply ? (
                    <p className="mt-2 rounded-xl border-l-2 border-primary bg-secondary/50 px-3 py-2 text-sm">
                      <span className="font-semibold">Your reply:</span> {c.reply}
                    </p>
                  ) : null}
                  {replyingTo === c.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendReply(c.id);
                      }}
                      className="mt-2 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
                    >
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`Reply to ${c.author}...`}
                        aria-label={`Reply to ${c.author}`}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                      <AppButton type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </AppButton>
                      <AppButton type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
                        <Send className="h-3 w-3" /> Send
                      </AppButton>
                    </form>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AppButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(c.id);
                          setDraft("");
                        }}
                      >
                        <Reply className="h-3 w-3" /> {c.reply ? "Edit reply" : "Reply"}
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        size="sm"
                        disabled={c.flagged}
                        onClick={() => {
                          setItems((list) => list.map((x) => (x.id === c.id ? { ...x, flagged: true } : x)));
                          showStatusToast("Comment reported", "Platform moderators will review it.", "info");
                        }}
                      >
                        <Flag className="h-3 w-3" /> {c.flagged ? "Reported" : "Report"}
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => setRemoving(c)}
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </AppButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this comment?"
        description={removing ? `${removing.author}'s comment will be hidden from the post.` : undefined}
        confirmLabel="Remove comment"
        tone="danger"
        onConfirm={() => {
          if (!removing) return;
          setItems((list) => list.filter((x) => x.id !== removing.id));
          showStatusToast("Comment removed", "The comment is no longer visible.", "warning");
          setRemoving(null);
        }}
      />
    </>
  );
}
