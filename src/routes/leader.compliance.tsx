import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, FileText, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import {
  complianceTone,
  createComplianceSubmission,
  formatComplianceStatus,
  useComplianceSubmissions,
  type ComplianceAttachment,
} from "@/lib/org-compliance";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/compliance")({
  component: LeaderCompliancePage,
});

function LeaderCompliancePage() {
  const navigate = useNavigate();
  const session = getSession();
  const submissions = useComplianceSubmissions().filter((submission) => submission.orgSlug === "cs-society");
  const [flagshipPrograms, setFlagshipPrograms] = useState(["Innovation Summit", "Hack Night"]);
  const [attachments, setAttachments] = useState<ComplianceAttachment[]>([{ id: "draft-1", label: "org-charter-summary.pdf" }]);
  const [form, setForm] = useState({
    academicYear: "2026-2027",
    category: "Academic",
    adviserName: "Prof. Elena Tan",
    memberCount: "412",
    accreditationScope: "Recognition renewal",
    mission: "Build student leaders in computing through guided projects, service, and campus collaboration.",
    vision: "Be the university's most trusted student technology community for innovation, ethics, and peer growth.",
    annualGoals: "Deliver four flagship programs, improve retention, and strengthen cross-college partnerships.",
    memberDevelopment: "Monthly skill labs, mentorship circles, and officer shadowing tracks for new volunteers.",
    riskControls: "Venue approvals, attendance cap planning, marshal assignments, and adviser-facing escalation rules.",
    budgetSummary: "Blend of member dues, sponsorship support, and project-based allocations with tracked spending checkpoints.",
    fundingModel: "Treasurer-led budgeting with pre-event estimates and post-event reconciliation per activity.",
    accountabilityPlan: "Quarterly reporting, workflow comments, and officer transition archival every academic year.",
    officerRosterSummary: "President, Vice President, Secretary, Treasurer, PRO, and committee leads mapped to clear owners.",
    transitionReadiness: "All major roles have shadow officers and handover notes prepared before the next cycle.",
    adviserNotes: "Organization is preparing a cleaner, workflow-based renewal packet for this cycle.",
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(submit: boolean) {
    if (!session) {
      toast.error("Session required");
      return;
    }
    const created = createComplianceSubmission({
      orgName: "UM Computer Studies Society",
      orgSlug: "cs-society",
      createdBy: session.name,
      academicYear: form.academicYear,
      submit,
      data: {
        category: form.category,
        adviserName: form.adviserName,
        memberCount: Number(form.memberCount) || 0,
        accreditationScope: form.accreditationScope,
        mission: form.mission,
        vision: form.vision,
        annualGoals: form.annualGoals,
        flagshipPrograms: flagshipPrograms.filter(Boolean),
        memberDevelopment: form.memberDevelopment,
        riskControls: form.riskControls,
        budgetSummary: form.budgetSummary,
        fundingModel: form.fundingModel,
        accountabilityPlan: form.accountabilityPlan,
        officerRosterSummary: form.officerRosterSummary,
        transitionReadiness: form.transitionReadiness,
        adviserNotes: form.adviserNotes,
        attachments,
      },
    });
    toast.success(submit ? "Submitted to adviser review" : "Draft saved");
    navigate({ to: "/leader/compliance/$submissionId", params: { submissionId: created.id } });
  }

  return (
    <>
      <PageHead
        title="Organization compliance"
        sub="Replace document-heavy recognition renewals with one guided accreditation workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_minmax(320px,0.9fr)]">
        <Panel title="Active accreditation cycles">
          {submissions.length === 0 ? (
            <EmptyState title="No accreditation cycles yet" sub="Create a guided compliance submission instead of assembling a paper packet." icon={Building2} />
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={complianceTone(submission.status)}>{formatComplianceStatus(submission.status)}</Badge>
                    <Badge tone="neutral">{submission.academicYear}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{submission.data.accreditationScope}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {submission.data.category} - {submission.data.memberCount} members - Adviser: {submission.data.adviserName}
                  </p>
                  <AppButton asChild variant="secondary" size="sm" className="mt-3">
                    <Link to="/leader/compliance/$submissionId" params={{ submissionId: submission.id }}>
                      Open workspace <ArrowRight className="h-4 w-4" />
                    </Link>
                  </AppButton>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Why this workflow">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>UMUnity now turns recognition renewals into structured sections with comments, approval history, and role-based handoffs.</p>
            <p>Use this workspace for adviser validation, Admin 2 compliance review, and Admin 1 final authority without collecting scattered PDFs first.</p>
          </div>
        </Panel>
      </div>

      <Panel title="New accreditation submission" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Academic year" value={form.academicYear} onChange={(value) => setField("academicYear", value)} />
          <Input label="Accreditation scope" value={form.accreditationScope} onChange={(value) => setField("accreditationScope", value)} />
          <Input label="Category" value={form.category} onChange={(value) => setField("category", value)} />
          <Input label="Adviser" value={form.adviserName} onChange={(value) => setField("adviserName", value)} />
          <Input label="Member count" value={form.memberCount} onChange={(value) => setField("memberCount", value)} />
          <TextArea label="Annual goals" value={form.annualGoals} onChange={(value) => setField("annualGoals", value)} />
          <TextArea label="Mission" value={form.mission} onChange={(value) => setField("mission", value)} />
          <TextArea label="Vision" value={form.vision} onChange={(value) => setField("vision", value)} />
          <TextArea label="Member development" value={form.memberDevelopment} onChange={(value) => setField("memberDevelopment", value)} />
          <TextArea label="Risk controls" value={form.riskControls} onChange={(value) => setField("riskControls", value)} />
          <TextArea label="Funding model" value={form.fundingModel} onChange={(value) => setField("fundingModel", value)} />
          <TextArea label="Budget summary" value={form.budgetSummary} onChange={(value) => setField("budgetSummary", value)} />
          <TextArea label="Accountability plan" value={form.accountabilityPlan} onChange={(value) => setField("accountabilityPlan", value)} />
          <TextArea label="Officer roster summary" value={form.officerRosterSummary} onChange={(value) => setField("officerRosterSummary", value)} />
          <TextArea label="Transition readiness" value={form.transitionReadiness} onChange={(value) => setField("transitionReadiness", value)} />
          <TextArea label="Adviser notes" value={form.adviserNotes} onChange={(value) => setField("adviserNotes", value)} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Flagship programs</p>
                <p className="text-xs text-muted-foreground">Repeatable rows instead of a static attachment list.</p>
              </div>
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => setFlagshipPrograms((current) => [...current, ""])}
              >
                <Plus className="h-4 w-4" /> Add
              </AppButton>
            </div>
            <div className="space-y-2">
              {flagshipPrograms.map((program, index) => (
                <input
                  key={`${program}-${index}`}
                  value={program}
                  onChange={(e) => setFlagshipPrograms((current) => current.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Attachments</p>
                <p className="text-xs text-muted-foreground">Only keep files that truly need an attachment.</p>
              </div>
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => setAttachments((current) => [...current, { id: `draft-${current.length + 1}`, label: `support-file-${current.length + 1}.pdf` }])}
              >
                <Plus className="h-4 w-4" /> Add
              </AppButton>
            </div>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={attachment.id} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={attachment.label}
                    onChange={(e) =>
                      setAttachments((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, label: e.target.value } : item)),
                      )
                    }
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <AppButton variant="secondary" onClick={() => submit(false)}>
            <FileText className="h-4 w-4" /> Save draft
          </AppButton>
          <AppButton variant="primary" onClick={() => submit(true)}>
            <Send className="h-4 w-4" /> Submit to adviser
          </AppButton>
        </div>
      </Panel>
    </>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
    </label>
  );
}
