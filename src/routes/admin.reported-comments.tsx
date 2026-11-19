import { createFileRoute } from "@tanstack/react-router";
import { ModerationQueue } from "@/components/dashboard/ModerationQueue";

const heading = (author: string, post: string) => (
  <>
    <span className="font-semibold">{author}</span>{" "}
    <span className="text-muted-foreground">on</span> <span className="font-medium">{post}</span>
  </>
);

export const Route = createFileRoute("/admin/reported-comments")({
  component: () => (
    <ModerationQueue
      title="Reported comments"
      sub="Take action on flagged comments across UMunity."
      noun="comment"
      items={[
        {
          id: "rc1",
          heading: heading("Anon123", "Officer elections opening soon"),
          body: "This is rigged lol",
          reason: "Harassment",
          meta: "1h ago",
        },
        {
          id: "rc2",
          heading: heading("Jana C.", "Plastic-Free May results"),
          body: "Numbers don't add up.",
          reason: "Misinformation",
          meta: "3h ago",
        },
        {
          id: "rc3",
          heading: heading("Karl M.", "Hack Night Vol. 3"),
          body: "spam-link-removed",
          reason: "Spam",
          meta: "1d ago",
        },
      ]}
      actions={[
        {
          label: "Dismiss",
          variant: "secondary",
          toastTitle: "Dismissed",
          toastBody: "This comment has been cleared from moderation.",
        },
        {
          label: "Warn user",
          variant: "primary",
          toastTitle: "User warned",
          toastBody: "A warning has been sent to the reported user.",
          tone: "info",
        },
        {
          label: "Remove",
          variant: "danger",
          toastTitle: "Comment removed",
          toastBody: "The flagged comment has been deleted.",
          tone: "warning",
          confirm: "Delete this comment?",
        },
      ]}
    />
  ),
});
