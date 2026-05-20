import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, UserCog } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { Badge, EmptyState, PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { createTransitionWorkflow, newWorkflowId, useTransitionWorkflows, type OfficerNominee } from "@/lib/workflows";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/leader/officer-transition")({
  component: LeaderOfficerTransitionPage,
});

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

  const filledNominees = useMemo(
    () => nominees.filter((nominee) => nominee.name.trim() && nominee.position.trim()),
    [nominees],
  );

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
          <Panel title="Nomination form">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic year</span>
                <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adviser</span>
                <input value="Prof. Elena Tan" disabled className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm opacity-80" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nomination rationale</span>
                <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} rows={4} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Handover notes</span>
                <textarea value={handoverNotes} onChange={(e) => setHandoverNotes(e.target.value)} rows={4} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm" />
              </label>
            </div>
          </Panel>

          <Panel title="Nominee slate">
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
            <AppButton
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() =>
                setNominees((current) => [
                  ...current,
                  { id: newWorkflowId("nominee"), name: "", position: "", program: "", yearLevel: "", email: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add nominee
            </AppButton>
          </Panel>
        </div>

        <div className="space-y-4">
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
