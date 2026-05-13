import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Calendar, Megaphone, MessageSquare, Sparkles, Check, Trash2, Inbox } from "lucide-react";
import { PageHead, Panel, Badge, EmptyState } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import {
  markAllRead,
  markRead,
  markUnread,
  removeNotification,
  unreadCount,
  useNotifications,
  type AppNotif,
  type NotifCategory,
} from "@/lib/notifications";

export const Route = createFileRoute("/student/notifications")({
  component: Notifications,
});

type Filter = "all" | "unread" | NotifCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "event", label: "Events" },
  { id: "announcement", label: "Announcements" },
  { id: "comment-reply", label: "Comment replies" },
  { id: "rsvp", label: "RSVPs" },
];

const ICONS: Record<NotifCategory, typeof Bell> = {
  event: Calendar,
  announcement: Megaphone,
  "comment-reply": MessageSquare,
  rsvp: Check,
  general: Sparkles,
};

const TONES: Record<NotifCategory, "gold" | "info" | "success" | "neutral"> = {
  event: "gold",
  announcement: "info",
  "comment-reply": "neutral",
  rsvp: "success",
  general: "neutral",
};

function Notifications() {
  const list = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const total = list.length;
    const unread = unreadCount(list);
    const byCat: Record<string, number> = {};
    for (const n of list) byCat[n.category] = (byCat[n.category] ?? 0) + 1;
    return { total, unread, byCat };
  }, [list]);

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    if (filter === "unread") return list.filter((n) => n.unread);
    return list.filter((n) => n.category === filter);
  }, [list, filter]);

  return (
    <>
      <PageHead
        title="Notifications"
        sub={`${counts.unread} unread of ${counts.total} updates.`}
        action={
          <AppButton variant="secondary" size="sm" onClick={() => markAllRead()} disabled={counts.unread === 0}>
            <Check className="h-4 w-4" /> Mark all read
          </AppButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel className="h-fit p-2">
          <div className="space-y-1">
            {FILTERS.map((f) => {
              const count =
                f.id === "all"
                  ? counts.total
                  : f.id === "unread"
                    ? counts.unread
                    : counts.byCat[f.id] ?? 0;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    active ? "bg-[color:color-mix(in_oklab,var(--primary)_8%,white)] text-primary" : "text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          {filtered.length === 0 ? (
            <EmptyState title="You're all caught up" sub="New notifications will show up here." icon={Inbox} />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((n) => (
                <NotifRow key={n.id} notif={n} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function NotifRow({ notif }: { notif: AppNotif }) {
  const Icon = ICONS[notif.category];
  return (
    <div className={`flex items-start gap-3 py-4 first:pt-0 last:pb-0 ${notif.unread ? "" : "opacity-75"}`}>
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${notif.unread ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={TONES[notif.category]}>{labelFor(notif.category)}</Badge>
          {notif.unread ? <span className="text-[10px] font-bold uppercase tracking-wider text-primary">New</span> : null}
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{notif.title}</p>
        <p className="text-xs text-muted-foreground">{notif.meta}</p>
      </div>
      <div className="flex items-center gap-1">
        {notif.unread ? (
          <button
            onClick={() => markRead(notif.id)}
            className="rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/8"
          >
            Mark read
          </button>
        ) : (
          <button
            onClick={() => markUnread(notif.id)}
            className="rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary"
          >
            Mark unread
          </button>
        )}
        <button
          onClick={() => removeNotification(notif.id)}
          aria-label="Remove notification"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-rose-100 hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function labelFor(c: NotifCategory) {
  switch (c) {
    case "event": return "Event";
    case "announcement": return "Announcement";
    case "comment-reply": return "Comment reply";
    case "rsvp": return "RSVP";
    default: return "Update";
  }
}
