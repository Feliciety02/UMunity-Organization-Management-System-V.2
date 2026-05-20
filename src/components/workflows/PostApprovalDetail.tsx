import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Globe, Lock, Megaphone, MessageSquareText, Pin, Send, FileText, Calendar } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import {
  addPostApprovalComment,
  approvePostApproval,
  formatPostApprovalStatus,
  postApprovalTone,
  requestPostApprovalRevision,
  type PostApproval,
} from "@/lib/post-approvals";
import type { WorkflowActor } from "@/lib/workflows";
import { toast } from "sonner";

function typeIcon(type: PostApproval["type"]) {
  switch (type) {
    case "announcement":
      return Megaphone;
    case "event":
      return Calendar;
    default:
      return FileText;
  }
}

export function PostApprovalDetail({
  approval,
  viewer,
  backTo,
  backLabel,
}: {
  approval: PostApproval;
  viewer: WorkflowActor;
  backTo: string;
  backLabel: string;
}) {
  const [comment, setComment] = useState("");
  const Icon = typeIcon(approval.type);
  const canReview =
    (viewer.role === "adviser" && approval.status === "pending_adviser") ||
    (viewer.role === "admin2" && approval.status === "pending_admin2");

  function addComment() {
    if (!comment.trim()) {
      toast.error("Add a comment first.");
      return;
    }
    addPostApprovalComment(approval.id, viewer, comment.trim());
    toast.success("Comment added");
    setComment("");
  }

  function requestRevision() {
    if (!comment.trim()) {
      toast.error("Write the revision request first.");
      return;
    }
    requestPostApprovalRevision(approval.id, viewer, comment.trim());
    toast.success("Revision requested");
    setComment("");
  }

  function approve() {
    approvePostApproval(approval.id, viewer);
    toast.success(viewer.role === "adviser" ? "Forwarded to Admin 2" : "Post published");
  }

  return (
    <>
      <PageHead
        title={approval.title || "Untitled post"}
        sub={`${approval.orgName} - ${approval.type} - ${approval.visibility}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary" size="sm">
              <Link to={backTo as string}>{backLabel}</Link>
            </AppButton>
            {canReview ? (
              <AppButton variant="primary" size="sm" onClick={approve}>
                <CheckCircle2 className="h-4 w-4" /> {viewer.role === "adviser" ? "Approve to Admin 2" : "Publish post"}
              </AppButton>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.7fr_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Panel title="Post preview">
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{approval.orgName}</p>
                  <p className="text-xs text-muted-foreground">Prepared by {approval.createdBy}</p>
                </div>
              </div>
              {approval.title ? <p className="text-lg font-semibold">{approval.title}</p> : null}
              <p className="mt-2 text-sm leading-6 text-foreground">{approval.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={postApprovalTone(approval.status)}>{formatPostApprovalStatus(approval.status)}</Badge>
                <Badge tone="info">{approval.type}</Badge>
                <Badge tone="neutral">{approval.visibility}</Badge>
                {approval.pinned ? <Badge tone="gold">Pinned</Badge> : null}
              </div>
            </div>
          </Panel>

          <Panel title="Publishing metadata">
            <div className="grid gap-3 md:grid-cols-2">
              <MetaCard label="Visibility" value={approval.visibility === "public" ? "Public campus view" : "Members only"} icon={approval.visibility === "public" ? Globe : Lock} />
              <MetaCard label="Pinned state" value={approval.pinned ? "Pinned after approval" : "Standard feed order"} icon={Pin} />
              <MetaCard label="Type" value={approval.type} icon={Icon} />
              <MetaCard label="Media" value={approval.imageLabel ?? "No image attached"} icon={FileText} />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Review notes">
            <div className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Leave a review note or revision request"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <AppButton variant="secondary" size="sm" onClick={addComment}>
                  <MessageSquareText className="h-4 w-4" /> Add comment
                </AppButton>
                {canReview ? (
                  <AppButton variant="ghost" size="sm" onClick={requestRevision}>
                    <Send className="h-4 w-4" /> Request revision
                  </AppButton>
                ) : null}
              </div>
              <div className="space-y-3">
                {approval.comments.length === 0 ? (
                  <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No comments yet.</div>
                ) : (
                  approval.comments.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone="neutral">{entry.authorRole}</Badge>
                          <p className="text-sm font-semibold">{entry.authorName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>

          <Panel title="History">
            <div className="space-y-3">
              {approval.history.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{entry.byName}</p>
                    <Badge tone="info">{entry.action.replaceAll("_", " ")}</Badge>
                  </div>
                  {entry.note ? <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function MetaCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Globe }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
