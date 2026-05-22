import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, FileText, Plus, Send, ShieldCheck, Users, Landmark } from "lucide-react";
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
import { SmartField, SmartFormSection, SmartProgressCard, SmartTextArea } from "@/components/workflows/SmartForm";

export const Route = createFileRoute("/leader/compliance")({
  component: LeaderCompliancePage,
});

const DRAFT_KEY = "umunity.compliance-draft";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        form?: typeof form;
        flagshipPrograms?: string[];
        attachments?: ComplianceAttachment[];
      };
      if (parsed.form) setForm((current) => ({ ...current, ...parsed.form }));
      if (parsed.flagshipPrograms?.length) setFlagshipPrograms(parsed.flagshipPrograms);
      if (parsed.attachments?.length) setAttachments(parsed.attachments);
    } catch {
      // Ignore malformed demo drafts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, flagshipPrograms, attachments }));
  }, [attachments, flagshipPrograms, form]);

  const completion = useMemo(() => {
    const fields = [
      form.academicYear,
      form.accreditationScope,
      form.category,
      form.adviserName,
      form.memberCount,
      form.mission,
      form.vision,
      form.annualGoals,
      form.memberDevelopment,
      form.riskControls,
      form.fundingModel,
      form.budgetSummary,
      form.accountabilityPlan,
      form.officerRosterSummary,
      form.transitionReadiness,
      form.adviserNotes,
    ];
    const total = fields.length + 2;
    const done =
      fields.filter((value) => value.trim()).length +
      (flagshipPrograms.filter((item) => item.trim()).length > 0 ? 1 : 0) +
      (attachments.filter((item) => item.label.trim()).length > 0 ? 1 : 0);
    return Math.round((done / total) * 100);
  }, [attachments, flagshipPrograms, form]);

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
    localStorage.removeItem(DRAFT_KEY);
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

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.55fr_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <SmartFormSection title="Organization profile" description="Core accreditation identity, adviser ownership, and roster scale.">
            <div className="grid gap-4 lg:grid-cols-2">
              <SmartField label="Academic year" value={form.academicYear} onChange={(value) => setField("academicYear", value)} icon={Landmark} />
              <SmartField label="Accreditation scope" value={form.accreditationScope} onChange={(value) => setField("accreditationScope", value)} icon={ShieldCheck} />
              <SmartField label="Category" value={form.category} onChange={(value) => setField("category", value)} icon={Building2} />
              <SmartField label="Adviser" value={form.adviserName} onChange={(value) => setField("adviserName", value)} icon={Users} />
              <SmartField label="Member count" value={form.memberCount} onChange={(value) => setField("memberCount", value)} icon={Users} />
            </div>
          </SmartFormSection>

          <SmartFormSection title="Governance narrative" description="Replace recognition packets with guided narrative sections and structured controls.">
            <div className="grid gap-4 lg:grid-cols-2">
              <SmartTextArea label="Annual goals" value={form.annualGoals} onChange={(value) => setField("annualGoals", value)} />
              <SmartTextArea label="Mission" value={form.mission} onChange={(value) => setField("mission", value)} />
              <SmartTextArea label="Vision" value={form.vision} onChange={(value) => setField("vision", value)} />
              <SmartTextArea label="Member development" value={form.memberDevelopment} onChange={(value) => setField("memberDevelopment", value)} />
              <SmartTextArea label="Risk controls" value={form.riskControls} onChange={(value) => setField("riskControls", value)} />
              <SmartTextArea label="Funding model" value={form.fundingModel} onChange={(value) => setField("fundingModel", value)} />
              <SmartTextArea label="Budget summary" value={form.budgetSummary} onChange={(value) => setField("budgetSummary", value)} />
              <SmartTextArea label="Accountability plan" value={form.accountabilityPlan} onChange={(value) => setField("accountabilityPlan", value)} />
              <SmartTextArea label="Officer roster summary" value={form.officerRosterSummary} onChange={(value) => setField("officerRosterSummary", value)} />
              <SmartTextArea label="Transition readiness" value={form.transitionReadiness} onChange={(value) => setField("transitionReadiness", value)} />
              <SmartTextArea label="Adviser notes" value={form.adviserNotes} onChange={(value) => setField("adviserNotes", value)} className="lg:col-span-2" />
            </div>
          </SmartFormSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <SmartFormSection
              title="Flagship programs"
              description="Repeatable rows instead of static activity attachments."
              action={
                <AppButton variant="secondary" size="sm" onClick={() => setFlagshipPrograms((current) => [...current, ""])}>
                  <Plus className="h-4 w-4" /> Add
                </AppButton>
              }
            >
              <div className="space-y-2">
                {flagshipPrograms.map((program, index) => (
                  <input
                    key={`${program}-${index}`}
                    value={program}
                    onChange={(e) => setFlagshipPrograms((current) => current.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm"
                  />
                ))}
              </div>
            </SmartFormSection>

            <SmartFormSection
              title="Attachments"
              description="Only keep files that truly need an attachment."
              action={
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttachments((current) => [...current, { id: `draft-${current.length + 1}`, label: `support-file-${current.length + 1}.pdf` }])}
                >
                  <Plus className="h-4 w-4" /> Add
                </AppButton>
              }
            >
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id} className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
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
            </SmartFormSection>
          </div>

          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary" onClick={() => submit(false)}>
              <FileText className="h-4 w-4" /> Save draft
            </AppButton>
            <AppButton variant="primary" onClick={() => submit(true)}>
              <Send className="h-4 w-4" /> Submit to adviser
            </AppButton>
          </div>
        </div>

        <div className="space-y-4">
          <SmartProgressCard
            title="Accreditation readiness"
            pct={completion}
            summary="This form now behaves like the event builder: guided sections, auto-saved draft state, and structured approval routing."
            steps={[
              { title: "Draft", detail: "Leader assembles the renewal record in structured sections.", active: true },
              { title: "Pending Adviser", detail: "Adviser validates organization profile, officer readiness, and controls." },
              { title: "Pending Admin 2", detail: "Secondary compliance review confirms accreditation readiness." },
              { title: "Pending Admin 1", detail: "Final authority grants recognition or requests follow-up." },
            ]}
          />
          <Panel title="Submission output">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Narrative governance and development sections</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Repeatable flagship program list</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Structured accountability and transition readiness</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Optional attachment list instead of document-first packets</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
