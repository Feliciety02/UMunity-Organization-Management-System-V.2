import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { PageHead, Panel, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { OrgAvatar } from "@/components/social/PostCard";
import { AppButton } from "@/components/ui/app-button";
import { organizations } from "@/data/site";
import { useDashboardPageLoading } from "@/lib/feedback";
import { markThreadRead, sendMessage, useThreads } from "@/lib/messages";

export const Route = createFileRoute("/student/messages")({
  component: Messages,
});

function Messages() {
  const loading = useDashboardPageLoading();
  const threads = useThreads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const orgBySlug = useMemo(() => Object.fromEntries(organizations.map((o) => [o.slug, o])), []);
  const active = threads.find((t) => t.id === activeId) ?? null;

  useEffect(() => {
    if (active?.unread) markThreadRead(active.id);
  }, [active]);

  function submit() {
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft.trim());
    setDraft("");
  }

  if (loading) {
    return (
      <>
        <PageHead title="Messages" sub="Loading your conversations." />
        <PanelSkeleton rows={4} />
      </>
    );
  }

  const unread = threads.filter((t) => t.unread).length;

  return (
    <>
      <PageHead title="Messages" sub={`Conversations with your organizations. ${unread} unread.`} />

      {threads.length === 0 ? (
        <Panel>
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            sub="Message an organization from its page to start a thread."
            action={
              <AppButton asChild variant="primary" size="sm">
                <Link to="/student/explore">Explore organizations</Link>
              </AppButton>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Panel className={`h-fit p-2 ${active ? "hidden lg:block" : ""}`}>
            <ul className="space-y-1">
              {threads.map((t) => {
                const org = orgBySlug[t.orgSlug];
                const last = t.messages[t.messages.length - 1];
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(t.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                        t.id === activeId ? "bg-secondary" : "hover:bg-secondary/70"
                      }`}
                    >
                      {org ? <OrgAvatar org={org} size={40} /> : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${t.unread ? "font-bold" : "font-semibold"}`}
                          >
                            {org?.name}
                          </p>
                          {t.unread ? (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-primary"
                              aria-label="Unread"
                            />
                          ) : null}
                        </div>
                        <p className="truncate text-xs font-medium text-foreground/80">
                          {t.subject}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{last?.text}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel className={active ? "" : "hidden lg:block"}>
            {active ? (
              <div className="flex min-h-[420px] flex-col">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    aria-label="Back to conversations"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <Link
                      to="/student/org/$slug"
                      params={{ slug: active.orgSlug }}
                      className="font-display text-base font-bold hover:underline"
                    >
                      {orgBySlug[active.orgSlug]?.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{active.subject}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 py-4">
                  {active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.from === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p
                          className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {m.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    aria-label="Message"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <AppButton
                    type="submit"
                    variant="primary"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </AppButton>
                </form>
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                sub="Pick a thread on the left to read and reply."
              />
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
