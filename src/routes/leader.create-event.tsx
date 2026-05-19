import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Plus,
  Tag,
  Target,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { createWorkflow, proposalCompletion, type EventProposalData } from "@/lib/workflows";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/create-event")({
  component: CreateEventWorkflowPage,
});

const CATEGORIES = ["Conference", "Workshop", "Competition", "Cultural", "Sports", "Community Outreach", "General Assembly", "Fundraiser"];
const SDG_OPTIONS = [
  "Quality Education",
  "Gender Equality",
  "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure",
  "Reduced Inequalities",
  "Climate Action",
];
const DRAFT_KEY = "umunity.event-workflow-draft";

function orgShortFrom(name?: string) {
  if (!name) return "UMORG";
  const letters = name.replace(/[^A-Za-z\s]/g, "").split(/\s+/).map((word) => word[0]).join("").toUpperCase();
  return letters.length >= 2 ? letters.slice(0, 6) : "UMORG";
}

function defaultProposal(): EventProposalData {
  return {
    title: "",
    category: CATEGORIES[0],
    objective: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    collaborators: [""],
    sdgs: ["Quality Education"],
    attachments: [],
    budgetItems: [{ id: crypto.randomUUID(), label: "", amount: 0, notes: "" }],
    timeline: [
      { id: crypto.randomUUID(), phase: "Planning", detail: "" },
      { id: crypto.randomUUID(), phase: "Event day", detail: "" },
      { id: crypto.randomUUID(), phase: "Post-event", detail: "" },
    ],
  };
}

function CreateEventWorkflowPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [proposal, setProposal] = useState<EventProposalData>(defaultProposal);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setProposal(JSON.parse(raw) as EventProposalData);
    } catch {
      // Ignore malformed drafts in demo mode.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(proposal));
  }, [proposal]);

  const completion = useMemo(() => proposalCompletion(proposal), [proposal]);
  const totalBudget = useMemo(
    () => proposal.budgetItems.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0),
    [proposal.budgetItems],
  );

  function patch<K extends keyof EventProposalData>(key: K, value: EventProposalData[K]) {
    setProposal((current) => ({ ...current, [key]: value }));
  }

  function updateBudgetItem(id: string, field: "label" | "amount" | "notes", value: string | number) {
    patch(
      "budgetItems",
      proposal.budgetItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function updateTimelineItem(id: string, field: "phase" | "detail", value: string) {
    patch(
      "timeline",
      proposal.timeline.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function finalize(submit: boolean) {
    if (!session) {
      toast.error("Your session expired. Sign in again.");
      navigate({ to: "/login" });
      return;
    }
    if (!proposal.title.trim()) {
      toast.error("Add an event title.");
      return;
    }
    if (!proposal.objective.trim() || !proposal.description.trim()) {
      toast.error("Complete the activity objective and description.");
      return;
    }
    if (!proposal.date || !proposal.time) {
      toast.error("Pick the event date and time.");
      return;
    }

    const normalized: EventProposalData = {
      ...proposal,
      collaborators: proposal.collaborators.map((item) => item.trim()).filter(Boolean),
      sdgs: proposal.sdgs.filter(Boolean),
      budgetItems: proposal.budgetItems.filter((item) => item.label.trim() || item.amount > 0),
      timeline: proposal.timeline.filter((item) => item.detail.trim()),
      attachments: proposal.attachments.filter(Boolean),
    };

    const workflow = createWorkflow({
      orgName: session.org ?? "UM Organization",
      orgShort: orgShortFrom(session.org),
      createdBy: session.name,
      proposal: normalized,
      submit,
    });

    localStorage.removeItem(DRAFT_KEY);
    toast.success(
      submit ? "Workflow submitted to adviser" : "Workflow draft saved",
      {
        description: submit
          ? "The proposal now moves through adviser, Admin 2, and Admin 1 review."
          : "You can reopen this draft from the event workflow dashboard.",
      },
    );
    navigate({ to: "/leader/workflows/$workflowId", params: { workflowId: workflow.id } });
  }

  return (
    <>
      <PageHead
        title="New event workflow"
        sub="Replace document-heavy submission with a structured approval flow. Draft once, route to adviser review, and keep every note in one place."
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary" size="sm" onClick={() => finalize(false)}>
              Save draft
            </AppButton>
            <AppButton variant="primary" size="sm" onClick={() => finalize(true)}>
              Submit to adviser
            </AppButton>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.8fr_minmax(320px,1fr)]">
        <div className="space-y-4">
          <Panel title="Activity proposal">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Event title"
                icon={FileText}
                value={proposal.title}
                onChange={(value) => patch("title", value)}
                placeholder="UM Innovation Summit 2026"
                className="md:col-span-2"
              />
              <SelectField
                label="Category"
                icon={Tag}
                value={proposal.category}
                onChange={(value) => patch("category", value)}
                options={CATEGORIES}
              />
              <Field
                label="Venue"
                icon={MapPin}
                value={proposal.venue}
                onChange={(value) => patch("venue", value)}
                placeholder="DPT Building Auditorium"
              />
              <Field
                label="Date"
                icon={Calendar}
                type="date"
                value={proposal.date}
                onChange={(value) => patch("date", value)}
              />
              <Field
                label="Time"
                icon={Clock}
                type="time"
                value={proposal.time}
                onChange={(value) => patch("time", value)}
              />
              <TextAreaField
                label="Event objective"
                icon={Target}
                value={proposal.objective}
                onChange={(value) => patch("objective", value)}
                placeholder="What problem does this activity solve for the organization and students?"
              />
              <TextAreaField
                label="Event description"
                icon={FileText}
                value={proposal.description}
                onChange={(value) => patch("description", value)}
                placeholder="Describe the program flow, audience, and expected experience."
              />
            </div>
          </Panel>

          <Panel title="Collaborators and SDG alignment">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <SectionLabel icon={Users} label="Collaborators" />
                {proposal.collaborators.map((item, index) => (
                  <div key={`collab-${index}`} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) =>
                        patch(
                          "collaborators",
                          proposal.collaborators.map((entry, currentIndex) => (currentIndex === index ? e.target.value : entry)),
                        )
                      }
                      placeholder="Partner org, sponsor, college unit"
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                    <AppButton
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "collaborators",
                          proposal.collaborators.length === 1
                            ? [""]
                            : proposal.collaborators.filter((_, currentIndex) => currentIndex !== index),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </AppButton>
                  </div>
                ))}
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() => patch("collaborators", [...proposal.collaborators, ""])}
                >
                  <Plus className="h-4 w-4" /> Add collaborator
                </AppButton>
              </div>

              <div className="space-y-3">
                <SectionLabel icon={Tag} label="SDG alignment" />
                <div className="flex flex-wrap gap-2">
                  {SDG_OPTIONS.map((sdg) => {
                    const active = proposal.sdgs.includes(sdg);
                    return (
                      <button
                        key={sdg}
                        onClick={() =>
                          patch(
                            "sdgs",
                            active ? proposal.sdgs.filter((item) => item !== sdg) : [...proposal.sdgs, sdg],
                          )
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
                        }`}
                      >
                        {sdg}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tag the outcomes your activity directly supports. These stay attached to the workflow history.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Budget builder">
            <div className="space-y-3">
              {proposal.budgetItems.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1.5fr_0.8fr_1fr_auto]">
                  <input
                    value={item.label}
                    onChange={(e) => updateBudgetItem(item.id, "label", e.target.value)}
                    placeholder="Expense line"
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.amount}
                    onChange={(e) => updateBudgetItem(item.id, "amount", Number(e.target.value))}
                    placeholder="Amount"
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    value={item.notes ?? ""}
                    onChange={(e) => updateBudgetItem(item.id, "notes", e.target.value)}
                    placeholder="Notes or supplier"
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <AppButton variant="ghost" size="icon" onClick={() => patch("budgetItems", proposal.budgetItems.filter((entry) => entry.id !== item.id))}>
                    <Trash2 className="h-4 w-4" />
                  </AppButton>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-4">
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    patch("budgetItems", [
                      ...proposal.budgetItems,
                      { id: crypto.randomUUID(), label: "", amount: 0, notes: "" },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" /> Add expense
                </AppButton>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Projected total</p>
                  <p className="font-display text-2xl font-bold">PHP {totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Timeline and optional attachments">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {proposal.timeline.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start gap-2">
                      <input
                        value={item.phase}
                        onChange={(e) => updateTimelineItem(item.id, "phase", e.target.value)}
                        className="w-40 rounded-2xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <textarea
                        rows={3}
                        value={item.detail}
                        onChange={(e) => updateTimelineItem(item.id, "detail", e.target.value)}
                        placeholder="Describe the work happening in this stage."
                        className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      />
                      <AppButton variant="ghost" size="icon" onClick={() => patch("timeline", proposal.timeline.filter((entry) => entry.id !== item.id))}>
                        <Trash2 className="h-4 w-4" />
                      </AppButton>
                    </div>
                  </div>
                ))}
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    patch("timeline", [
                      ...proposal.timeline,
                      { id: crypto.randomUUID(), phase: "Custom stage", detail: "" },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" /> Add timeline block
                </AppButton>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/35 px-4 py-6 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-secondary/50">
                  <Upload className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Optional supporting uploads</p>
                    <p className="text-xs text-muted-foreground">Keep attachments lightweight. The core submission should still live in structured fields.</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []).map((file) => file.name);
                      patch("attachments", [...proposal.attachments, ...files]);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                <div className="space-y-2">
                  {proposal.attachments.length === 0 ? (
                    <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
                      No attachments yet. That is fine for this workflow.
                    </div>
                  ) : (
                    proposal.attachments.map((attachment) => (
                      <div key={attachment} className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {attachment}
                        </span>
                        <button
                          onClick={() => patch("attachments", proposal.attachments.filter((item) => item !== attachment))}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Workflow progress">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Form readiness</span>
                  <span className="font-semibold text-foreground">{completion.pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${completion.pct}%` }} />
                </div>
              </div>
              <div className="grid gap-2">
                <StepCard title="Draft" detail="Leader builds the workflow in a Google Forms style flow." active />
                <StepCard title="Pending Adviser" detail="Adviser reviews content, activity details, and officer readiness." />
                <StepCard title="Pending Admin 2" detail="Secondary compliance review after adviser approval." />
                <StepCard title="Pending Admin 1" detail="Final university authority review." />
                <StepCard title="Approved" detail="Workflow opens preparation, checklist, and post-event stages." />
              </div>
            </div>
          </Panel>

          <Panel title="Smart workflow notes">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>This builder turns the old paperwork stack into a structured workflow record with comments, approval history, and clear routing.</p>
              <p>Uploads are optional. The system prioritizes form fields, repeatable budget rows, timeline blocks, and approval checkpoints.</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info">Auto-save draft</Badge>
                <Badge tone="gold">Structured budget</Badge>
                <Badge tone="success">Approval history</Badge>
              </div>
            </div>
          </Panel>

          <Panel title="Submission output">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Event objective and activity details</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Budget table with auto totals</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Venue, collaborators, and SDG alignment</li>
              <li className="rounded-2xl bg-secondary/35 px-3 py-2">Timeline, comments, and approval history</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  icon: typeof FileText;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: typeof Tag;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof FileText;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function StepCard({ title, detail, active = false }: { title: string; detail: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${active ? "border-primary/30 bg-primary/8" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        {active ? <Badge tone="info">Current</Badge> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}
