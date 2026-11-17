import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { SearchX } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showStatusToast, useDashboardPageLoading } from "@/lib/feedback";

export type ModerationItem = { id: string; heading: ReactNode; body: string; reason: string; meta: string };

export type ModerationAction = {
  label: string;
  variant: "primary" | "secondary" | "danger";
  toastTitle: string;
  toastBody: string;
  tone?: "success" | "info" | "warning";
  /** Ask before running; used for destructive actions. */
  confirm?: string;
};

/** Shared moderation list: every action resolves the item and removes it from the queue. */
export function ModerationQueue({
  title,
  sub,
  noun,
  items: initialItems,
  actions,
}: {
  title: string;
  sub: string;
  noun: string;
  items: ModerationItem[];
  actions: ModerationAction[];
}) {
  const loading = useDashboardPageLoading();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<{ item: ModerationItem; action: ModerationAction } | null>(null);

  function run(item: ModerationItem, action: ModerationAction) {
    setItems((list) => list.filter((x) => x.id !== item.id));
    showStatusToast(action.toastTitle, action.toastBody, action.tone ?? "success");
  }

  if (loading) {
    return (
      <>
        <PageHead title={title} sub="Loading moderation queue." />
        <PanelSkeleton rows={6} />
      </>
    );
  }

  return (
    <>
      <PageHead title={title} sub={`${sub} ${items.length} waiting.`} />
      <Panel>
        {items.length === 0 ? (
          <EmptyState
            title={`No reported ${noun}s`}
            sub="Your moderation queue is clear for now."
            icon={SearchX}
            action={
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/admin">Back to dashboard</Link>
              </AppButton>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{item.heading}</div>
                  <p className="mt-1 rounded-md bg-secondary/60 p-2 text-sm">{item.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone="warning">{item.reason}</Badge>
                    <span className="text-muted-foreground">{item.meta}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <AppButton
                      key={action.label}
                      size="sm"
                      variant={action.variant === "danger" ? "ghost" : action.variant}
                      className={action.variant === "danger" ? "border border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" : undefined}
                      onClick={() => (action.confirm ? setPending({ item, action }) : run(item, action))}
                    >
                      {action.label}
                    </AppButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.action.confirm ?? ""}
        description="This can't be undone."
        confirmLabel={pending?.action.label}
        tone="danger"
        onConfirm={() => {
          if (pending) run(pending.item, pending.action);
          setPending(null);
        }}
      />
    </>
  );
}
