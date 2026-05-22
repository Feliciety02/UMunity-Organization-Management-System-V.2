import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, UserCog, Users, ClipboardList } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { createTransitionWorkflow, newWorkflowId, useTransitionWorkflows, type OfficerNominee } from "@/lib/workflows";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";
import { SmartField, SmartFormSection, SmartProgressCard, SmartTextArea } from "@/components/workflows/SmartForm";

export const Route = createFileRoute("/leader/officer-transition")({
  component: LeaderOfficerTransitionPage,
});

const DRAFT_KEY = "umunity.officer-transition-draft";

function LeaderOfficerTransitionPage() {
  const navigate = useNavigate();
  const session = getSession();
  const transitions = useTransitionWorkflows().filter((workflow) => workflow.orgName === session?.org);
  const currentYear = new Date().getFullYear();
  const [academicYear, setAcademicYear] = useState(`${currentYear}-${currentYear + 1}`);
  const [rationale, setRationale] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [nominees, setNominees] = useState<OfficerNominee[]>([
    { id: newWorkflowId("nominee"), name: "", position: "President", program: "", yearLevel: "", email: "" },
    { id: newWorkflowId("nominee"), name: "", position: "Vice President", program: "", yearLevel: "", email: "" },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        academicYear?: string;
        rationale?: string;
        handoverNotes?: string;
        nominees?: OfficerNominee[];
      };
      if (parsed.academicYear) setAcademicYear(parsed.academicYear);
      if (parsed.rationale) setRationale(parsed.rationale);
      if (parsed.handoverNotes) setHandoverNotes(parsed.handoverNotes);
      if (parsed.nominees?.length) setNominees(parsed.nominees);
    } catch {
      // Ignore malformed demo drafts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ academicYear, rationale, handoverNotes, nominees }));
  }, [academicYear, handoverNotes, nominees, rationale]);

  const filledNominees = useMemo(
    () => nominees.filter((nominee) => nominee.name.trim() && nominee.position.trim()),
    [nominees],
  );
  const completion = useMemo(() => {
    const total = 4;
    const done =
      (academicYear.trim() ? 1 : 0) +
      (rationale.trim() ? 1 : 0) +
      (handoverNotes.trim() ? 1 : 0) +
      (filledNominees.length >= 2 ? 1 : 0);
    return Math.round((done / total) * 100);
  }, [academicYear, filledNominees.length, handoverNotes, rationale]);

  function updateNominee(id: string, field: keyof OfficerNominee, value: string) {
    setNominees((current) => current.map((nominee) => (nominee.id === id ? { ...nominee, [field]: value } : nominee)));
  }

  function submitTransition() {
    if (!session?.org) {
      toast.error("No organization found in this session.");
      return;
    }
    if (!rationale.trim()) {
      toast.error("Add the nomination rationale.");
      return;
    }
    if (filledNominees.length < 2) {
      toast.error("Add at least two officer nominees.");
      return;
    }
    const workflow = createTransitionWorkflow({
      orgName: session.org,
      orgShort: session.org.replace(/[^A-Za-z]/g, "").slice(0, 6).toUpperCase() || "UMORG",
      submittedBy: session.name,
      adviserName: "Prof. Elena Tan",
      academicYear,
      rationale,
      handoverNotes,
      nominees: filledNominees,
    });
    toast.success("Officer transition submitted");
    localStorage.removeItem(DRAFT_KEY);
    navigate({ to: "/leader/officer-transition/$transitionId", params: { transitionId: workflow.id } });
  }

  return (
    <>
      <PageHead
        title="Officer transition"
        sub="Nominate the next officer set through a governed workflow. Leader changes are no longer direct profile edits."
        action={
          <AppButton variant="primary" size="sm" onClick={submitTransition}>
            Submit transition
          </AppButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_minmax(320px,1fr)]">
        <div className="space-y-4">
          <SmartFormSection title="Nomination form" description="Annual officer replacement is now governed through one reviewable transition record.">
            <div className="grid gap-4 md:grid-cols-2">
              <SmartField label="Academic year" value={academicYear} onChange={setAcademicYear} icon={ClipboardList} />
              <SmartField label="Adviser" value="Prof. Elena Tan" disabled icon={Users} />
              <SmartTextArea label="Nomination rationale" value={rationale} onChange={setRationale} rows={4} className="md:col-span-2" />
              <SmartTextArea label="Handover notes" value={handoverNotes} onChange={setHandoverNotes} rows={4} className="md:col-span-2" />
            </div>
          </SmartFormSection>

          <SmartFormSection title="Nominee slate" description="Build the proposed officer set in repeatable rows instead of manual yearly replacement." action={
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() =>
                setNominees((current) => [
                  ...current,
                  { id: newWorkflowId("nominee"), name: "", position: "", program: "", yearLevel: "", email: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add nominee
            </AppButton>
          }>
            <div className="space-y-3">
              {nominees.map((nominee) => (
                <div key={nominee.id} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
                  <input value={nominee.name} onChange={(e) => updateNominee(nominee.id, "name", e.target.value)} placeholder="Full name" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
                  <input value={nominee.position} onChange={(e) => updateNominee(nominee.id, "position", e.target.value)} placeholder="Position" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
                  <input value={nominee.program} onChange={(e) => updateNominee(nominee.id, "program", e.target.value)} placeholder="Program" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
                  <input value={nominee.yearLevel} onChange={(e) => updateNominee(nominee.id, "yearLevel", e.target.value)} placeholder="Year level" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
                  <input value={nominee.email} onChange={(e) => updateNominee(nominee.id, "email", e.target.value)} placeholder="Email" className="rounded-2xl border border-border bg-background px-4 py-3 text-sm md:col-span-2" />
                </div>
              ))}
            </div>
          </SmartFormSection>
        </div>

        <div className="space-y-4">
          <SmartProgressCard
            title="Transition readiness"
            pct={completion}
            summary="Drafts now auto-save and route through adviser validation before Admin 1 archives the approved cycle."
            steps={[
              { title: "Draft", detail: "Leader prepares the nominee slate and handover notes.", active: true },
              { title: "Pending Adviser", detail: "Adviser checks eligibility, continuity, and nominations." },
              { title: "Pending Admin 1", detail: "Final university approval archives the officer cycle." },
              { title: "Archived", detail: "Previous leadership history is preserved for future records." },
            ]}
          />
          <Panel title="Submitted transitions">
            {transitions.length === 0 ? (
              <EmptyState title="No transition workflows yet" sub="Submit the first officer nomination set for adviser review." icon={UserCog} />
            ) : (
              <div className="space-y-3">
                {transitions.map((workflow) => (
                  <div key={workflow.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Badge tone="gold">AY {workflow.academicYear}</Badge>
                      <Badge tone="info">{workflow.nominees.length} nominees</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{workflow.currentStage}</p>
                    <p className="text-xs text-muted-foreground">{workflow.rationale}</p>
                    <AppButton asChild variant="secondary" size="sm" className="mt-3">
                      <Link to="/leader/officer-transition/$transitionId" params={{ transitionId: workflow.id }}>
                        Open transition <ArrowRight className="h-4 w-4" />
                      </Link>
                    </AppButton>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
