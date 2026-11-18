import { createFileRoute } from "@tanstack/react-router";
import { ModerationQueue } from "@/components/dashboard/ModerationQueue";

export const Route = createFileRoute("/admin/reported-posts")({
  component: () => (
    <ModerationQueue
      title="Reported posts"
      sub="Review and act on flagged organization posts."
      noun="post"
      items={[
        { id: "rp1", heading: <span className="font-semibold">UM Debate Council</span>, body: "Open tryouts this Friday at Bolton Hall...", reason: "Misinformation", meta: "Reported by Anonymous · 30m ago" },
        { id: "rp2", heading: <span className="font-semibold">UM Athletics League</span>, body: "Sportsfest rules unfair to first-years", reason: "Harassment", meta: "Reported by Marvin L. · 2h ago" },
        { id: "rp3", heading: <span className="font-semibold">UM Theatre Guild</span>, body: "Cultural Night auditions sign-up...", reason: "Spam", meta: "Reported by Anonymous · 1d ago" },
      ]}
      actions={[
        { label: "Dismiss", variant: "secondary", toastTitle: "Marked safe", toastBody: "The post was cleared from moderation." },
        { label: "Hide", variant: "primary", toastTitle: "Post hidden", toastBody: "The post is hidden from the feed while the org is notified.", tone: "warning" },
        { label: "Remove", variant: "danger", toastTitle: "Post removed", toastBody: "The post has been permanently removed.", tone: "warning", confirm: "Remove this post permanently?" },
      ]}
    />
  ),
});
