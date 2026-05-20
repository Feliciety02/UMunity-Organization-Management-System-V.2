import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Archive, ArrowRight, CheckCircle2, MessageSquareText, Send } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import {
  addTransitionComment,
  approveTransitionWorkflow,
  formatWorkflowStatus,
  requestTransitionRevision,
  statusTone,
  type OfficerTransitionWorkflow,
  type WorkflowActor,
} from "@/lib/workflows";
import { toast } from "sonner";

export function OfficerTransitionDetail({
  workflow,
  viewer,
  backTo,
  backLabel,
}: {
  workflow: OfficerTransitionWorkflow;
  viewer: WorkflowActor;
  backTo: string;
  backLabel: string;
}) {
  const [comment, setComment] = useState("");
  const canAdviserApprove = viewer.role === "adviser" && workflow.status === "pending_adviser";
  const canAdminApprove = viewer.role === "admin1" && workflow.status === "pending_admin1";
  const canReview = canAdviserApprove || canAdminApprove;

  function submitComment() {
    if (!comment.trim()) {
      toast.error("Add a comment first.");
      return;
    }
    addTransitionComment(workflow.id, viewer, comment.trim());
    toast.success("Comment added");
    setComment("");
  }

  function requestRevision() {
    if (!comment.trim()) {
      toast.error("Write the revision request first.");
      return;
    }
    requestTransitionRevision(workflow.id, viewer, comment.trim());
    toast.success("Revision requested");
    setComment("");
  }

  function approve() {
    approveTransitionWorkflow(workflow.id, viewer);
    toast.success(viewer.role === "adviser" ? "Forwarded to Admin 1" : "Transition approved and archived");
  }

  return (
    <>
      <PageHead
        title={`${workflow.orgShort} officer transition`}
        sub={`${workflow.academicYear} - ${workflow.orgName}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary" size="sm">
              <Link to={backTo as string}>{backLabel}</Link>
            </AppButton>
            {canReview ? (
              <AppButton variant="primary" size="sm" onClick={approve}>
                <CheckCircle2 className="h-4 w-4" /> {viewer.role === "adviser" ? "Validate nominees" : "Approve and archive"}
              </AppButton>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.8fr_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(workflow.status)}>{formatWorkflowStatus(workflow.status)}</Badge>
                  <Badge tone="gold">AY {workflow.academicYear}</Badge>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{workflow.rationale}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/35 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Stage</p>
                <p className="mt-2 font-display text-2xl font-bold">{workflow.currentStage}</p>
                <p className="text-xs text-muted-foreground">Submitted by {workflow.submittedBy}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Nominee slate">
            <div className="space-y-3">
              {workflow.nominees.map((nominee) => (
                <div key={nominee.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {nominee.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{nominee.name}</p>
                    <p className="text-xs text-muted-foreground">{nominee.position} - {nominee.program} - {nominee.yearLevel}</p>
                    <p className="text-xs text-muted-foreground">{nominee.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Handover and archive plan">
            <div className="space-y-3">
              <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                {workflow.handoverNotes}
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Archive className="h-4 w-4 text-primary" /> Archived officer records
                </div>
                <div className="space-y-3">
                  {workflow.archivedOfficers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No archived officer records yet.</p>
                  ) : (
                    workflow.archivedOfficers.map((archive) => (
                      <div key={archive.id} className="rounded-2xl bg-secondary/35 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{archive.academicYear}</p>
                          <Badge tone="neutral">{archive.officers.length} officers</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Archived by {archive.approvedBy} on {new Date(archive.archivedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Approval lane">
            <div className="space-y-3">
              <LaneRow label="Organization leader" detail={workflow.submittedBy} active={workflow.status === "revision_requested"} />
              <LaneRow label="Adviser" detail={workflow.adviserName} active={workflow.status === "pending_adviser"} />
              <LaneRow label="Admin 1" detail="University final approval" active={workflow.status === "pending_admin1"} />
              <LaneRow label="Archive" detail="Previous officers preserved in history" active={workflow.status === "completed"} />
            </div>
          </Panel>

          <Panel title="Review comments">
            <div className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Leave a review note or revision request"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <AppButton variant="secondary" size="sm" onClick={submitComment}>
                  <MessageSquareText className="h-4 w-4" /> Add comment
                </AppButton>
                {canReview ? (
                  <AppButton variant="ghost" size="sm" onClick={requestRevision}>
                    <Send className="h-4 w-4" /> Request revision
                  </AppButton>
                ) : null}
              </div>
              <div className="space-y-3">
                {workflow.comments.length === 0 ? (
                  <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                    No comments yet.
                  </div>
                ) : (
                  workflow.comments.map((entry) => (
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
              {workflow.history.map((entry) => (
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

function LaneRow({ label, detail, active }: { label: string; detail: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${active ? "border-primary/30 bg-primary/8" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>
        {active ? <Badge tone="info">Current</Badge> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
