import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Clock3,
  FileText,
  ImagePlus,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/app-button";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import {
  addWorkflowComment,
  addWorkflowEventDayMedia,
  addWorkflowParticipationLog,
  addWorkflowPostEventAsset,
  approveWorkflow,
  formatWorkflowStatus,
  getWorkflowStages,
  markWorkflowCompleted,
  operationsCompletion,
  proposalCompletion,
  requestWorkflowRevision,
  setWorkflowFormReady,
  statusTone,
  submitWorkflow,
  toggleWorkflowChecklistItem,
  updateWorkflowEventDay,
  updateWorkflowPostEvent,
  type EventWorkflow,
  type WorkflowActor,
  type WorkflowActorRole,
} from "@/lib/workflows";

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
  const [logEntry, setLogEntry] = useState("");
  const [mediaEntry, setMediaEntry] = useState("");
  const [achievementEntry, setAchievementEntry] = useState("");
  const [documentationEntry, setDocumentationEntry] = useState("");
  const [reflection, setReflection] = useState(workflow.operations.postEvent.reflection);
  const [outcomes, setOutcomes] = useState(workflow.operations.postEvent.outcomes);
  const [summary, setSummary] = useState(workflow.operations.postEvent.finalSummary);

  const stages = useMemo(() => getWorkflowStages(workflow.status), [workflow.status]);
  const completion = useMemo(() => proposalCompletion(workflow.proposal), [workflow.proposal]);
  const lifecycle = useMemo(() => operationsCompletion(workflow), [workflow]);
  const totalBudget = useMemo(
    () => workflow.proposal.budgetItems.reduce((sum, item) => sum + item.amount, 0),
    [workflow.proposal.budgetItems],
  );

  const canSubmit = viewer.role === "leader" && (workflow.status === "draft" || workflow.status === "revision_requested");
  const canReview =
    (viewer.role === "adviser" && workflow.status === "pending_adviser") ||
    (viewer.role === "admin2" && workflow.status === "pending_admin2") ||
    (viewer.role === "admin1" && workflow.status === "pending_admin1");
  const canOperate = viewer.role === "leader" && (workflow.status === "approved" || workflow.status === "completed");
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

  function savePostEventFields() {
    updateWorkflowPostEvent(workflow.id, viewer, {
      reflection,
      outcomes,
      finalSummary: summary,
    });
    toast.success("Post-event report updated");
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
              <div className="grid min-w-[240px] gap-3">
                <MetricCard
                  label="Proposal completion"
                  value={`${completion.pct}%`}
                  sub={`${completion.done} of ${completion.total} structured sections filled`}
                />
                <MetricCard
                  label="Lifecycle completion"
                  value={`${lifecycle.pct}%`}
                  sub={`${lifecycle.done} of ${lifecycle.total} workflow tasks completed`}
                />
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

          <Panel title="Preparation dashboard">
            <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
              <div className="space-y-3">
                {workflow.operations.preparationChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => canOperate && toggleWorkflowChecklistItem(workflow.id, item.id, viewer)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left ${
                      item.done ? "border-emerald-500/25 bg-emerald-500/10" : "border-border bg-card"
                    } ${canOperate ? "transition hover:border-primary/30" : "cursor-default"}`}
                  >
                    <div className={`mt-0.5 grid h-6 w-6 place-items-center rounded-lg ${item.done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"}`}>
                      <CheckSquare className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-3 rounded-3xl border border-border bg-secondary/30 p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Smart forms and tools</p>
                  <div className="mt-3 space-y-2">
                    <ToggleRow
                      label="Requirements tracker linked"
                      active={workflow.operations.forms.requirementsTrackerReady}
                      canToggle={canOperate}
                      onToggle={() =>
                        setWorkflowFormReady(
                          workflow.id,
                          "requirementsTrackerReady",
                          !workflow.operations.forms.requirementsTrackerReady,
                          viewer,
                        )
                      }
                    />
                    <ToggleRow
                      label="Attendance collection ready"
                      active={workflow.operations.forms.attendeeCollectionReady}
                      canToggle={canOperate}
                      onToggle={() =>
                        setWorkflowFormReady(
                          workflow.id,
                          "attendeeCollectionReady",
                          !workflow.operations.forms.attendeeCollectionReady,
                          viewer,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <AppButton asChild variant="secondary" size="sm">
                    <Link to="/leader/requirements">
                      <ClipboardCheck className="h-4 w-4" /> Open requirements tracker
                    </Link>
                  </AppButton>
                  <AppButton asChild variant="ghost" size="sm">
                    <Link to="/leader/attendees">
                      <Users className="h-4 w-4" /> Open attendance tools
                    </Link>
                  </AppButton>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Event day dashboard">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance target</span>
                  <input
                    type="number"
                    value={workflow.operations.eventDay.attendanceTarget}
                    disabled={!canOperate}
                    onChange={(e) =>
                      updateWorkflowEventDay(workflow.id, viewer, {
                        attendanceTarget: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none disabled:opacity-70"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actual attendance</span>
                  <input
                    type="number"
                    value={workflow.operations.eventDay.attendanceActual}
                    disabled={!canOperate}
                    onChange={(e) =>
                      updateWorkflowEventDay(workflow.id, viewer, {
                        attendanceActual: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none disabled:opacity-70"
                  />
                </label>
                <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                  This stage is meant to replace scattered attendance sheets and post-event catch-up notes with one live operations log.
                </div>
              </div>

              <div className="space-y-4">
                <InlineComposer
                  label="Participation log"
                  value={logEntry}
                  onChange={setLogEntry}
                  placeholder="Add an event-day note, attendance checkpoint, or volunteer handoff."
                  buttonLabel="Add log"
                  icon={Target}
                  disabled={!canOperate}
                  onSubmit={() => {
                    if (!logEntry.trim()) return;
                    addWorkflowParticipationLog(workflow.id, viewer, logEntry.trim());
                    toast.success("Participation log added");
                    setLogEntry("");
                  }}
                />
                <InlineComposer
                  label="Media upload block"
                  value={mediaEntry}
                  onChange={setMediaEntry}
                  placeholder="Add a media filename or coverage set"
                  buttonLabel="Add media"
                  icon={ImagePlus}
                  disabled={!canOperate}
                  onSubmit={() => {
                    if (!mediaEntry.trim()) return;
                    addWorkflowEventDayMedia(workflow.id, viewer, mediaEntry.trim());
                    toast.success("Media entry added");
                    setMediaEntry("");
                  }}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <ListPanel title="Participation logs" items={workflow.operations.eventDay.participationLogs} empty="No event-day logs yet." />
                  <ListPanel title="Media uploads" items={workflow.operations.eventDay.mediaUploads} empty="No media coverage entries yet." />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Post-event closeout">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <TextAreaRow
                  label="Reflection"
                  value={reflection}
                  onChange={setReflection}
                  disabled={!canOperate}
                  placeholder="What worked, what failed, and what should change next time?"
                />
                <TextAreaRow
                  label="Outcomes"
                  value={outcomes}
                  onChange={setOutcomes}
                  disabled={!canOperate}
                  placeholder="Document the measurable outcomes, impact, and participant response."
                />
                <TextAreaRow
                  label="Final summary"
                  value={summary}
                  onChange={setSummary}
                  disabled={!canOperate}
                  placeholder="Capture the concise final narrative that reviewers should see."
                />
                {canOperate ? (
                  <AppButton variant="secondary" size="sm" onClick={savePostEventFields}>
                    Save post-event report
                  </AppButton>
                ) : null}
              </div>
              <div className="space-y-4">
                <InlineComposer
                  label="Achievement summary"
                  value={achievementEntry}
                  onChange={setAchievementEntry}
                  placeholder="Add a key achievement or milestone"
                  buttonLabel="Add achievement"
                  icon={Sparkles}
                  disabled={!canOperate}
                  onSubmit={() => {
                    if (!achievementEntry.trim()) return;
                    addWorkflowPostEventAsset(workflow.id, viewer, "achievements", achievementEntry.trim());
                    toast.success("Achievement added");
                    setAchievementEntry("");
                  }}
                />
                <InlineComposer
                  label="Documentation block"
                  value={documentationEntry}
                  onChange={setDocumentationEntry}
                  placeholder="Add a documentation reference, album, or report file"
                  buttonLabel="Add doc"
                  icon={FileText}
                  disabled={!canOperate}
                  onSubmit={() => {
                    if (!documentationEntry.trim()) return;
                    addWorkflowPostEventAsset(workflow.id, viewer, "documentation", documentationEntry.trim());
                    toast.success("Documentation entry added");
                    setDocumentationEntry("");
                  }}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <ListPanel title="Achievements" items={workflow.operations.postEvent.achievements} empty="No achievements recorded yet." />
                  <ListPanel title="Documentation" items={workflow.operations.postEvent.documentation} empty="No documentation items yet." />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Approval lane">
            <div className="space-y-3">
              <LaneRow label="Leader" detail={workflow.createdBy} active={workflow.status === "draft" || workflow.status === "revision_requested"} />
              <LaneRow label="Adviser" detail="Prof. Elena Tan" active={workflow.status === "pending_adviser"} />
              <LaneRow label="Admin 2" detail="OSA Compliance Review" active={workflow.status === "pending_admin2"} />
              <LaneRow label="Admin 1" detail="University Final Authority" active={workflow.status === "pending_admin1"} />
              <LaneRow label="Execution" detail="Preparation, event-day tracking, and final closeout" active={workflow.status === "approved" || workflow.status === "completed"} />
            </div>
          </Panel>

          <Panel title="Execution snapshot">
            <div className="space-y-3">
              <SnapshotRow label="Preparation checklist" value={`${lifecycle.checklistDone}/${lifecycle.checklistTotal}`} />
              <SnapshotRow label="Requirements tracker" value={workflow.operations.forms.requirementsTrackerReady ? "Ready" : "Pending"} />
              <SnapshotRow label="Attendance tools" value={workflow.operations.forms.attendeeCollectionReady ? "Ready" : "Pending"} />
              <SnapshotRow label="Event-day logs" value={`${workflow.operations.eventDay.participationLogs.length}`} />
              <SnapshotRow label="Media blocks" value={`${workflow.operations.eventDay.mediaUploads.length}`} />
              <SnapshotRow label="Documentation entries" value={`${workflow.operations.postEvent.documentation.length}`} />
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
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
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

function ToggleRow({
  label,
  active,
  canToggle,
  onToggle,
}: {
  label: string;
  active: boolean;
  canToggle: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={!canToggle}
      className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm ${
        active ? "border-emerald-500/25 bg-emerald-500/10" : "border-border bg-card"
      } ${canToggle ? "transition hover:border-primary/30" : "cursor-default opacity-80"}`}
    >
      <span>{label}</span>
      <Badge tone={active ? "success" : "neutral"}>{active ? "Ready" : "Pending"}</Badge>
    </button>
  );
}

function InlineComposer({
  label,
  value,
  onChange,
  placeholder,
  buttonLabel,
  icon: Icon,
  disabled,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  buttonLabel: string;
  icon: typeof FileText;
  disabled?: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none disabled:opacity-70"
        />
        <AppButton variant="secondary" size="sm" onClick={onSubmit} disabled={disabled || !value.trim()}>
          {buttonLabel}
        </AppButton>
      </div>
    </div>
  );
}

function TextAreaRow({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none disabled:opacity-70"
      />
    </label>
  );
}

function ListPanel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((item, index) => (
            <div key={`${title}-${index}`} className="rounded-xl bg-secondary/35 px-3 py-2 text-sm">
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-secondary/35 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
