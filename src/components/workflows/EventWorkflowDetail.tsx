import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  MessageSquareText,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import {
  addWorkflowComment,
  approveWorkflow,
  formatWorkflowStatus,
  getWorkflowStages,
  markWorkflowCompleted,
  proposalCompletion,
  requestWorkflowRevision,
  statusTone,
  submitWorkflow,
  type EventWorkflow,
  type WorkflowActor,
  type WorkflowActorRole,
} from "@/lib/workflows";
import { toast } from "sonner";

function money(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount);
}

function formatDateTime(date: string, time: string) {
  return [date || "TBA", time || ""].filter(Boolean).join(" - ");
}

function stageLabelFor(role: WorkflowActorRole) {
  switch (role) {
    case "leader":
      return "organization leader";
    case "adviser":
      return "adviser";
    case "admin2":
      return "Admin 2";
    case "admin1":
      return "Admin 1";
  }
}

function approvalActionLabel(role: WorkflowActorRole) {
  switch (role) {
    case "adviser":
      return "Approve to Admin 2";
    case "admin2":
      return "Approve to Admin 1";
    case "admin1":
      return "Final approve";
    default:
      return "Approve";
  }
}

export function EventWorkflowDetail({
  workflow,
  viewer,
  backTo,
  backLabel,
}: {
  workflow: EventWorkflow;
  viewer: WorkflowActor;
  backTo: string;
  backLabel: string;
}) {
  const [comment, setComment] = useState("");
  const stages = useMemo(() => getWorkflowStages(workflow.status), [workflow.status]);
  const completion = useMemo(() => proposalCompletion(workflow.proposal), [workflow.proposal]);
  const totalBudget = useMemo(
    () => workflow.proposal.budgetItems.reduce((sum, item) => sum + item.amount, 0),
    [workflow.proposal.budgetItems],
  );

  const canSubmit = viewer.role === "leader" && (workflow.status === "draft" || workflow.status === "revision_requested");
  const canReview =
    (viewer.role === "adviser" && workflow.status === "pending_adviser") ||
    (viewer.role === "admin2" && workflow.status === "pending_admin2") ||
    (viewer.role === "admin1" && workflow.status === "pending_admin1");
  const canComplete = viewer.role === "leader" && workflow.status === "approved";

  function handleComment() {
    if (!comment.trim()) {
      toast.error("Add a comment before posting.");
      return;
    }
    addWorkflowComment(workflow.id, viewer, comment.trim());
    toast.success("Comment added");
    setComment("");
  }

  function handleSubmit() {
    submitWorkflow(workflow.id, viewer);
    toast.success("Workflow submitted to adviser");
  }

  function handleApprove() {
    approveWorkflow(workflow.id, viewer);
    toast.success(`${approvalActionLabel(viewer.role)} complete`);
  }

  function handleRevision() {
    if (!comment.trim()) {
      toast.error("Write the revision request first.");
      return;
    }
    requestWorkflowRevision(workflow.id, viewer, comment.trim());
    toast.success("Revision request sent");
    setComment("");
  }

  function handleComplete() {
    markWorkflowCompleted(workflow.id, viewer, "Leader marked the workflow as post-event complete.");
    toast.success("Workflow marked complete");
  }

  return (
    <>
      <PageHead
        title={workflow.proposal.title}
        sub={`${workflow.orgName} - ${formatDateTime(workflow.proposal.date, workflow.proposal.time)} - ${workflow.proposal.venue || "Venue TBA"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary" size="sm">
              <Link to={backTo as string}>{backLabel}</Link>
            </AppButton>
            {canSubmit ? (
              <AppButton variant="primary" size="sm" onClick={handleSubmit}>
                <Send className="h-4 w-4" /> Submit to adviser
              </AppButton>
            ) : null}
            {canReview ? (
              <AppButton variant="primary" size="sm" onClick={handleApprove}>
                <CheckCircle2 className="h-4 w-4" /> {approvalActionLabel(viewer.role)}
              </AppButton>
            ) : null}
            {canComplete ? (
              <AppButton variant="primary" size="sm" onClick={handleComplete}>
                <ClipboardCheck className="h-4 w-4" /> Mark completed
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
                  <Badge tone="info">{workflow.proposal.category}</Badge>
                  <Badge tone="gold">AY {workflow.ay}</Badge>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{workflow.proposal.description}</p>
              </div>
              <div className="min-w-[200px] rounded-2xl border border-border bg-secondary/35 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Proposal completion</p>
                <p className="mt-2 font-display text-3xl font-bold">{completion.pct}%</p>
                <p className="text-xs text-muted-foreground">{completion.done} of {completion.total} sections filled</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${completion.pct}%` }} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Workflow timeline">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`rounded-2xl border p-4 ${
                    stage.state === "done"
                      ? "border-emerald-500/25 bg-emerald-500/10"
                      : stage.state === "current"
                        ? "border-primary/30 bg-primary/8"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-xl ${
                        stage.state === "done"
                          ? "bg-emerald-500 text-white"
                          : stage.state === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {stage.state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{stage.label}</p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {stage.state === "done" ? "Complete" : stage.state === "current" ? "Current" : "Upcoming"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{stage.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Activity proposal">
              <div className="space-y-4 text-sm">
                <WorkflowField label="Objective" value={workflow.proposal.objective} />
                <WorkflowField label="Description" value={workflow.proposal.description} />
                <WorkflowField label="Venue" value={workflow.proposal.venue || "Not set"} />
                <WorkflowField label="Schedule" value={formatDateTime(workflow.proposal.date, workflow.proposal.time)} />
                <WorkflowField label="Collaborators" value={workflow.proposal.collaborators.join(", ") || "None"} />
                <WorkflowField label="SDG alignment" value={workflow.proposal.sdgs.join(", ") || "None"} />
              </div>
            </Panel>

            <Panel title="Budget and logistics">
              <div className="space-y-3">
                {workflow.proposal.budgetItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        {item.notes ? <p className="text-xs text-muted-foreground">{item.notes}</p> : null}
                      </div>
                      <span className="text-sm font-semibold">{money(item.amount)}</span>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl bg-secondary/35 p-3 text-sm">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total projected budget</span>
                    <span>{money(totalBudget)}</span>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Timeline and repeatable sections">
              <div className="space-y-3">
                {workflow.proposal.timeline.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.phase}</p>
                    <p className="mt-1 text-sm text-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Attachments">
              {workflow.proposal.attachments.length > 0 ? (
                <div className="space-y-2">
                  {workflow.proposal.attachments.map((attachment) => (
                    <div key={attachment} className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {attachment}
                      </span>
                      <Badge tone="neutral">Optional</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                  This workflow keeps attachments optional. Most submission details now live directly in structured fields.
                </div>
              )}
            </Panel>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Approval lane">
            <div className="space-y-3">
              <LaneRow label="Leader" detail={workflow.createdBy} active={workflow.status === "draft" || workflow.status === "revision_requested"} />
              <LaneRow label="Adviser" detail="Prof. Elena Tan" active={workflow.status === "pending_adviser"} />
              <LaneRow label="Admin 2" detail="OSA Compliance Review" active={workflow.status === "pending_admin2"} />
              <LaneRow label="Admin 1" detail="University Final Authority" active={workflow.status === "pending_admin1"} />
              <LaneRow label="Preparation" detail="Checklists, attendance, media, and post-event reporting" active={workflow.status === "approved" || workflow.status === "completed"} />
            </div>
          </Panel>

          <Panel title="Comments and revisions">
            <div className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={`Leave a note for the ${stageLabelFor(viewer.role)} workflow handoff`}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <AppButton variant="secondary" size="sm" onClick={handleComment}>
                  <MessageSquareText className="h-4 w-4" /> Add comment
                </AppButton>
                {canReview ? (
                  <AppButton variant="ghost" size="sm" onClick={handleRevision}>
                    Request revision
                  </AppButton>
                ) : null}
              </div>
              <div className="space-y-3">
                {workflow.comments.length === 0 ? (
                  <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                    No comments yet. Reviewers can leave inline guidance here instead of asking for separate paper notes.
                  </div>
                ) : (
                  workflow.comments.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone="neutral">{stageLabelFor(item.authorRole)}</Badge>
                          <p className="text-sm font-semibold">{item.authorName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-foreground">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Approval history">
            <div className="space-y-3">
              {workflow.history.map((entry) => (
                <div key={entry.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {entry.byName} <span className="font-normal text-muted-foreground">({stageLabelFor(entry.byRole)})</span>
                    </p>
                    <p className="text-xs uppercase tracking-wider text-primary">{entry.action.replaceAll("_", " ")}</p>
                    {entry.note ? <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {workflow.status === "approved" || workflow.status === "completed" ? (
            <Panel title="Next operational tools">
              <div className="space-y-3">
                <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                  Once the proposal is cleared, the organization can move into checklist execution, attendance, media capture, and final post-event reporting.
                </div>
                <AppButton asChild variant="secondary" size="sm">
                  <Link to="/leader/requirements">
                    <ClipboardCheck className="h-4 w-4" /> Open requirements tracker
                  </Link>
                </AppButton>
                <AppButton asChild variant="ghost" size="sm">
                  <Link to="/leader/attendees">
                    <Users className="h-4 w-4" /> Review attendance tools
                  </Link>
                </AppButton>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}

function WorkflowField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/35 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
    </div>
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
