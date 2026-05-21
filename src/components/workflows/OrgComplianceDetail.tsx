import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, CheckCircle2, ClipboardCheck, FileText, Landmark, MessageSquareText, Send, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/app-button";
import { Badge, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import {
  addComplianceComment,
  approveCompliance,
  complianceTone,
  formatComplianceStatus,
  requestComplianceRevision,
  type OrgComplianceSubmission,
} from "@/lib/org-compliance";
import type { WorkflowActor } from "@/lib/workflows";

export function OrgComplianceDetail({
  submission,
  viewer,
  backTo,
  backLabel,
}: {
  submission: OrgComplianceSubmission;
  viewer: WorkflowActor;
  backTo: string;
  backLabel: string;
}) {
  const [comment, setComment] = useState("");

  const canReview =
    (viewer.role === "adviser" && submission.status === "pending_adviser") ||
    (viewer.role === "admin2" && submission.status === "pending_admin2") ||
    (viewer.role === "admin1" && submission.status === "pending_admin1");

  const stageLabel = useMemo(() => {
    if (viewer.role === "adviser") return "Approve to Admin 2";
    if (viewer.role === "admin2") return "Escalate to Admin 1";
    if (viewer.role === "admin1") return "Approve accreditation";
    return "Review";
  }, [viewer.role]);

  function addComment() {
    if (!comment.trim()) {
      toast.error("Add a comment first.");
      return;
    }
    addComplianceComment(submission.id, viewer, comment.trim());
    toast.success("Comment added");
    setComment("");
  }

  function requestRevision() {
    if (!comment.trim()) {
      toast.error("Write the revision request first.");
      return;
    }
    requestComplianceRevision(submission.id, viewer, comment.trim());
    toast.success("Revision requested");
    setComment("");
  }

  function approve() {
    approveCompliance(submission.id, viewer);
    toast.success(stageLabel);
  }

  return (
    <>
      <PageHead
        title={`${submission.orgName} accreditation`}
        sub={`${submission.academicYear} - ${submission.data.accreditationScope}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary" size="sm">
              <Link to={backTo as string}>{backLabel}</Link>
            </AppButton>
            {canReview ? (
              <AppButton variant="primary" size="sm" onClick={approve}>
                <CheckCircle2 className="h-4 w-4" /> {stageLabel}
              </AppButton>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.65fr_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Panel title="Accreditation profile">
            <div className="grid gap-3 md:grid-cols-2">
              <MetaCard label="Category" value={submission.data.category} icon={Building2} />
              <MetaCard label="Status" value={formatComplianceStatus(submission.status)} icon={ShieldCheck} tone={complianceTone(submission.status)} />
              <MetaCard label="Adviser" value={submission.data.adviserName} icon={Users} />
              <MetaCard label="Members" value={`${submission.data.memberCount} active members`} icon={Users} />
              <MetaCard label="Scope" value={submission.data.accreditationScope} icon={ClipboardCheck} />
              <MetaCard label="Academic year" value={submission.academicYear} icon={Landmark} />
            </div>
          </Panel>

          <Panel title="Organization narrative">
            <SectionBlock title="Mission" value={submission.data.mission} />
            <SectionBlock title="Vision" value={submission.data.vision} />
            <SectionBlock title="Annual goals" value={submission.data.annualGoals} />
            <SectionBlock title="Member development" value={submission.data.memberDevelopment} />
          </Panel>

          <Panel title="Operations and accountability">
            <SectionBlock title="Flagship programs" value={submission.data.flagshipPrograms.join(", ")} />
            <SectionBlock title="Risk controls" value={submission.data.riskControls} />
            <SectionBlock title="Funding model" value={submission.data.fundingModel} />
            <SectionBlock title="Budget summary" value={submission.data.budgetSummary} />
            <SectionBlock title="Accountability plan" value={submission.data.accountabilityPlan} />
            <SectionBlock title="Officer roster summary" value={submission.data.officerRosterSummary} />
            <SectionBlock title="Transition readiness" value={submission.data.transitionReadiness} />
            <SectionBlock title="Adviser notes" value={submission.data.adviserNotes} />
          </Panel>

          <Panel title="Attachments">
            <div className="grid gap-3 md:grid-cols-2">
              {submission.data.attachments.length === 0 ? (
                <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No supporting attachments included.</div>
              ) : (
                submission.data.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{attachment.label}</p>
                      <p className="text-xs text-muted-foreground">Support file placeholder</p>
                    </div>
                  </div>
                ))
              )}
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
                placeholder="Leave a compliance note or revision request"
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
                {submission.comments.length === 0 ? (
                  <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">No comments yet.</div>
                ) : (
                  submission.comments.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone="neutral">{entry.authorRole}</Badge>
                          <p className="text-sm font-semibold">{entry.authorName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="mt-2 text-sm">{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>

          <Panel title="History">
            <div className="space-y-3">
              {submission.history.map((entry) => (
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

function MetaCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      {tone ? (
        <div className="mt-2">
          <Badge tone={tone}>{value}</Badge>
        </div>
      ) : (
        <p className="mt-2 text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function SectionBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
