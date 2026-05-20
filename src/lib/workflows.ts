import { useEffect, useState, useSyncExternalStore } from "react";
import { addNotification } from "@/lib/notifications";

export type WorkflowStatus =
  | "draft"
  | "pending_adviser"
  | "revision_requested"
  | "pending_admin2"
  | "pending_admin1"
  | "approved"
  | "completed";

export type WorkflowActorRole = "leader" | "adviser" | "admin2" | "admin1";

export type WorkflowActor = {
  role: WorkflowActorRole;
  name: string;
};

export type ProposalBudgetItem = {
  id: string;
  label: string;
  amount: number;
  notes?: string;
};

export type ProposalTimelineItem = {
  id: string;
  phase: string;
  detail: string;
};

export type EventProposalData = {
  title: string;
  category: string;
  objective: string;
  description: string;
  venue: string;
  date: string;
  time: string;
  collaborators: string[];
  sdgs: string[];
  attachments: string[];
  budgetItems: ProposalBudgetItem[];
  timeline: ProposalTimelineItem[];
};

export type WorkflowChecklistItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

export type WorkflowEventDayData = {
  attendanceTarget: number;
  attendanceActual: number;
  mediaUploads: string[];
  participationLogs: string[];
};

export type WorkflowPostEventData = {
  reflection: string;
  outcomes: string;
  achievements: string[];
  documentation: string[];
  finalSummary: string;
};

export type WorkflowOperations = {
  preparationChecklist: WorkflowChecklistItem[];
  forms: {
    requirementsTrackerReady: boolean;
    attendeeCollectionReady: boolean;
  };
  eventDay: WorkflowEventDayData;
  postEvent: WorkflowPostEventData;
};

export type WorkflowComment = {
  id: string;
  authorRole: WorkflowActorRole;
  authorName: string;
  message: string;
  createdAt: number;
  sectionId?: string;
};

export type WorkflowHistoryEntry = {
  id: string;
  action:
    | "created"
    | "draft_saved"
    | "submitted"
    | "commented"
    | "revision_requested"
    | "resubmitted"
    | "approved"
    | "completed"
    | "operations_updated";
  byRole: WorkflowActorRole;
  byName: string;
  note?: string;
  createdAt: number;
};

export type EventWorkflow = {
  id: string;
  orgName: string;
  orgShort: string;
  ay: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  ownerRole: WorkflowActorRole;
  status: WorkflowStatus;
  currentStage: string;
  proposal: EventProposalData;
  operations: WorkflowOperations;
  comments: WorkflowComment[];
  history: WorkflowHistoryEntry[];
};

export type OfficerNominee = {
  id: string;
  name: string;
  position: string;
  program: string;
  yearLevel: string;
  email: string;
};

export type OfficerRecord = {
  id: string;
  academicYear: string;
  officers: OfficerNominee[];
  archivedAt: number;
  approvedBy: string;
};

export type OfficerTransitionWorkflow = {
  id: string;
  orgName: string;
  orgShort: string;
  submittedBy: string;
  academicYear: string;
  status: WorkflowStatus;
  currentStage: string;
  createdAt: number;
  updatedAt: number;
  adviserName: string;
  nominees: OfficerNominee[];
  rationale: string;
  handoverNotes: string;
  comments: WorkflowComment[];
  history: WorkflowHistoryEntry[];
  archivedOfficers: OfficerRecord[];
};

const KEY = "umunity.workflows.v1";
const EVENT = "umunity:workflows";
const TRANSITION_KEY = "umunity.transitions.v1";
const TRANSITION_EVENT = "umunity:transitions";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newWorkflowId(prefix: string) {
  return nowId(prefix);
}

function currentAy() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function defaultOperations(title: string): WorkflowOperations {
  return {
    preparationChecklist: [
      {
        id: nowId("check"),
        title: "Finalize event workflow fields",
        detail: `Confirm ${title} details, venue, and activity scope before execution.`,
        done: true,
      },
      {
        id: nowId("check"),
        title: "Open requirements tracker",
        detail: "Translate remaining paperwork into a guided checklist and track clear owners.",
        done: false,
      },
      {
        id: nowId("check"),
        title: "Prepare attendance and participation forms",
        detail: "Ready the check-in, QR, and participation log flow for event day.",
        done: false,
      },
      {
        id: nowId("check"),
        title: "Set up post-event reflection blocks",
        detail: "Pre-create the report and narrative prompts for faster closeout.",
        done: false,
      },
    ],
    forms: {
      requirementsTrackerReady: false,
      attendeeCollectionReady: false,
    },
    eventDay: {
      attendanceTarget: 150,
      attendanceActual: 0,
      mediaUploads: [],
      participationLogs: [],
    },
    postEvent: {
      reflection: "",
      outcomes: "",
      achievements: [],
      documentation: [],
      finalSummary: "",
    },
  };
}

function normalizeOperations(title: string, input?: Partial<WorkflowOperations> | null): WorkflowOperations {
  const fallback = defaultOperations(title);
  return {
    preparationChecklist:
      input?.preparationChecklist?.length
        ? input.preparationChecklist.map((item, index) => ({
            id: item.id || `legacy-check-${index}`,
            title: item.title || fallback.preparationChecklist[index % fallback.preparationChecklist.length].title,
            detail: item.detail || "",
            done: !!item.done,
          }))
        : fallback.preparationChecklist,
    forms: {
      requirementsTrackerReady: !!input?.forms?.requirementsTrackerReady,
      attendeeCollectionReady: !!input?.forms?.attendeeCollectionReady,
    },
    eventDay: {
      attendanceTarget: input?.eventDay?.attendanceTarget ?? fallback.eventDay.attendanceTarget,
      attendanceActual: input?.eventDay?.attendanceActual ?? 0,
      mediaUploads: input?.eventDay?.mediaUploads ?? [],
      participationLogs: input?.eventDay?.participationLogs ?? [],
    },
    postEvent: {
      reflection: input?.postEvent?.reflection ?? "",
      outcomes: input?.postEvent?.outcomes ?? "",
      achievements: input?.postEvent?.achievements ?? [],
      documentation: input?.postEvent?.documentation ?? [],
      finalSummary: input?.postEvent?.finalSummary ?? "",
    },
  };
}

function normalizeWorkflow(workflow: EventWorkflow): EventWorkflow {
  return {
    ...workflow,
    operations: normalizeOperations(workflow.proposal.title, workflow.operations),
  };
}

function seedWorkflows(): EventWorkflow[] {
  const baseTime = Date.now() - 3 * 86_400_000;
  return [
    normalizeWorkflow({
      id: "workflow-innovation-summit",
      orgName: "UM Computer Studies Society",
      orgShort: "UMCSS",
      ay: currentAy(),
      createdAt: baseTime,
      updatedAt: Date.now() - 4 * 60 * 60 * 1000,
      createdBy: "Marco Reyes",
      ownerRole: "leader",
      status: "pending_adviser",
      currentStage: "Adviser approval",
      proposal: {
        title: "UM Innovation Summit 2026",
        category: "Conference",
        objective: "Connect student innovators with mentors and alumni through a one-day showcase.",
        description: "A campus-wide summit with keynote talks, startup booths, and project demos.",
        venue: "DPT Building Auditorium",
        date: "2026-05-24",
        time: "09:00",
        collaborators: ["College of Computer Studies", "UM Alumni Tech Circle"],
        sdgs: ["Quality Education", "Industry, Innovation and Infrastructure"],
        attachments: ["concept-note.pdf", "venue-layout.png"],
        budgetItems: [
          { id: "b1", label: "Stage and AV", amount: 18000, notes: "Shared package quote" },
          { id: "b2", label: "Speaker hospitality", amount: 8500 },
          { id: "b3", label: "Publicity materials", amount: 4200 },
        ],
        timeline: [
          { id: "t1", phase: "Pre-event", detail: "Registration launch and speaker confirmations" },
          { id: "t2", phase: "Event day", detail: "Program proper, project exhibits, and attendance check-in" },
          { id: "t3", phase: "Post-event", detail: "Reflection form, liquidation, and documentation wrap-up" },
        ],
      },
      operations: {
        ...defaultOperations("UM Innovation Summit 2026"),
        forms: { requirementsTrackerReady: true, attendeeCollectionReady: true },
        eventDay: {
          attendanceTarget: 300,
          attendanceActual: 0,
          mediaUploads: ["event-stage-layout.png"],
          participationLogs: ["Volunteer briefing scheduled for 7:30 AM."],
        },
      },
      comments: [
        {
          id: "c1",
          authorRole: "adviser",
          authorName: "Prof. Elena Tan",
          message: "Please clarify the fallback venue plan if the auditorium reaches capacity.",
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
          sectionId: "activity",
        },
      ],
      history: [
        {
          id: "h1",
          action: "created",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Initial event workflow draft created.",
          createdAt: baseTime,
        },
        {
          id: "h2",
          action: "submitted",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Submitted to adviser for first review.",
          createdAt: Date.now() - 10 * 60 * 60 * 1000,
        },
        {
          id: "h3",
          action: "commented",
          byRole: "adviser",
          byName: "Prof. Elena Tan",
          note: "Asked for a venue contingency note before approval.",
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
        },
      ],
    }),
    normalizeWorkflow({
      id: "workflow-hack-night",
      orgName: "UM Computer Studies Society",
      orgShort: "UMCSS",
      ay: currentAy(),
      createdAt: baseTime - 5 * 86_400_000,
      updatedAt: Date.now() - 18 * 60 * 60 * 1000,
      createdBy: "Marco Reyes",
      ownerRole: "leader",
      status: "pending_admin2",
      currentStage: "Admin 2 review",
      proposal: {
        title: "Hack Night Vol. 3",
        category: "Workshop",
        objective: "Run a practical coding lab to improve peer project readiness.",
        description: "Late afternoon workshop with mentor stations and challenge prompts.",
        venue: "CCS Laboratory 3",
        date: "2026-06-02",
        time: "16:00",
        collaborators: ["Google Developer Student Club"],
        sdgs: ["Quality Education"],
        attachments: ["mentor-lineup.pdf"],
        budgetItems: [
          { id: "b4", label: "Snacks", amount: 3500 },
          { id: "b5", label: "Extension cables", amount: 1200 },
        ],
        timeline: [
          { id: "t4", phase: "Planning", detail: "Mentor alignment and registration push" },
          { id: "t5", phase: "Workshop", detail: "Coding sprints and project clinics" },
          { id: "t6", phase: "Closeout", detail: "Feedback form and attendance export" },
        ],
      },
      operations: {
        ...defaultOperations("Hack Night Vol. 3"),
        preparationChecklist: defaultOperations("Hack Night Vol. 3").preparationChecklist.map((item, index) => ({
          ...item,
          done: index < 2,
        })),
        forms: { requirementsTrackerReady: true, attendeeCollectionReady: true },
        eventDay: {
          attendanceTarget: 80,
          attendanceActual: 0,
          mediaUploads: [],
          participationLogs: ["Mentor station assignments drafted."],
        },
      },
      comments: [],
      history: [
        {
          id: "h4",
          action: "created",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Workflow started from leader dashboard.",
          createdAt: baseTime - 5 * 86_400_000,
        },
        {
          id: "h5",
          action: "submitted",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Sent to adviser review.",
          createdAt: Date.now() - 40 * 60 * 60 * 1000,
        },
        {
          id: "h6",
          action: "approved",
          byRole: "adviser",
          byName: "Prof. Elena Tan",
          note: "Cleared for secondary compliance review.",
          createdAt: Date.now() - 20 * 60 * 60 * 1000,
        },
      ],
    }),
    normalizeWorkflow({
      id: "workflow-cultural-night",
      orgName: "UM Cultural Guild",
      orgShort: "UMCG",
      ay: currentAy(),
      createdAt: baseTime - 10 * 86_400_000,
      updatedAt: Date.now() - 26 * 60 * 60 * 1000,
      createdBy: "Angela Bautista",
      ownerRole: "leader",
      status: "pending_admin1",
      currentStage: "Admin 1 approval",
      proposal: {
        title: "Cultural Night 2026",
        category: "Cultural",
        objective: "Celebrate student identity through performances and storytelling.",
        description: "A night program with inter-college performances and partner community guests.",
        venue: "UM Gymnasium",
        date: "2026-06-18",
        time: "18:30",
        collaborators: ["College of Education", "UM Theatre Guild"],
        sdgs: ["Reduced Inequalities", "Peace, Justice and Strong Institutions"],
        attachments: ["program-flow.pdf", "security-plan.pdf"],
        budgetItems: [
          { id: "b6", label: "Stage lights", amount: 22000 },
          { id: "b7", label: "Documentation team", amount: 6000 },
        ],
        timeline: [
          { id: "t7", phase: "Preparation", detail: "Casting, rehearsals, and venue coordination" },
          { id: "t8", phase: "Main event", detail: "Performances, backstage management, and ushering" },
          { id: "t9", phase: "Aftercare", detail: "Narrative report and archive curation" },
        ],
      },
      operations: {
        ...defaultOperations("Cultural Night 2026"),
        preparationChecklist: defaultOperations("Cultural Night 2026").preparationChecklist.map((item, index) => ({
          ...item,
          done: index < 3,
        })),
        forms: { requirementsTrackerReady: true, attendeeCollectionReady: true },
        eventDay: {
          attendanceTarget: 500,
          attendanceActual: 0,
          mediaUploads: ["security-zones-map.pdf"],
          participationLogs: ["Backstage marshal list prepared."],
        },
      },
      comments: [],
      history: [
        {
          id: "h7",
          action: "created",
          byRole: "leader",
          byName: "Angela Bautista",
          note: "Created by organization leader.",
          createdAt: baseTime - 10 * 86_400_000,
        },
        {
          id: "h8",
          action: "submitted",
          byRole: "leader",
          byName: "Angela Bautista",
          note: "Submitted to adviser review.",
          createdAt: Date.now() - 70 * 60 * 60 * 1000,
        },
        {
          id: "h9",
          action: "approved",
          byRole: "adviser",
          byName: "Prof. Maya Flores",
          note: "Approved and passed to Admin 2.",
          createdAt: Date.now() - 52 * 60 * 60 * 1000,
        },
        {
          id: "h10",
          action: "approved",
          byRole: "admin2",
          byName: "Dr. Miguel Soriano",
          note: "Compliance confirmed. Sent for final authority review.",
          createdAt: Date.now() - 26 * 60 * 60 * 1000,
        },
      ],
    }),
  ];
}

function seedTransitionWorkflows(): OfficerTransitionWorkflow[] {
  const previousRoster: OfficerNominee[] = [
    { id: "off-1", name: "Marco Reyes", position: "President", program: "BS Computer Science", yearLevel: "4th Year", email: "marco.reyes@um.edu.ph" },
    { id: "off-2", name: "Anna Sy", position: "Vice President", program: "BS Information Technology", yearLevel: "3rd Year", email: "anna.sy@um.edu.ph" },
    { id: "off-3", name: "Jules Tan", position: "Treasurer", program: "BS Computer Science", yearLevel: "3rd Year", email: "jules.tan@um.edu.ph" },
  ];
  return [
    {
      id: "transition-umcss-2026",
      orgName: "UM Computer Studies Society",
      orgShort: "UMCSS",
      submittedBy: "Marco Reyes",
      academicYear: "2026-2027",
      status: "pending_adviser",
      currentStage: "Adviser validation",
      createdAt: Date.now() - 2 * 86_400_000,
      updatedAt: Date.now() - 90 * 60_000,
      adviserName: "Prof. Elena Tan",
      nominees: [
        { id: "nom-1", name: "Karl Mendez", position: "President", program: "BS Computer Science", yearLevel: "3rd Year", email: "karl.mendez@um.edu.ph" },
        { id: "nom-2", name: "Pia Lim", position: "Vice President", program: "BS Information Systems", yearLevel: "3rd Year", email: "pia.lim@um.edu.ph" },
        { id: "nom-3", name: "Mia Cruz", position: "Secretary", program: "BS Computer Science", yearLevel: "2nd Year", email: "mia.cruz@um.edu.ph" },
      ],
      rationale: "The organization is preparing its next academic year officer set based on current committee performance and continuity planning.",
      handoverNotes: "Outgoing officers will transfer shared drive folders, event templates, and sponsor contacts during the final week of June.",
      comments: [
        {
          id: "tc-1",
          authorRole: "leader",
          authorName: "Marco Reyes",
          message: "Included next-year committee leads who already handled major events this semester.",
          createdAt: Date.now() - 70 * 60_000,
        },
      ],
      history: [
        {
          id: "th-1",
          action: "created",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Officer transition nomination submitted.",
          createdAt: Date.now() - 2 * 86_400_000,
        },
        {
          id: "th-2",
          action: "submitted",
          byRole: "leader",
          byName: "Marco Reyes",
          note: "Sent to adviser for validation.",
          createdAt: Date.now() - 2 * 86_400_000 + 10 * 60_000,
        },
      ],
      archivedOfficers: [
        {
          id: "archive-2025",
          academicYear: "2025-2026",
          officers: previousRoster,
          archivedAt: Date.now() - 30 * 86_400_000,
          approvedBy: "Admin 1 Archive",
        },
      ],
    },
  ];
}

function read(): EventWorkflow[] {
  if (typeof window === "undefined") return seedWorkflows();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = seedWorkflows();
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return (JSON.parse(raw) as EventWorkflow[]).map(normalizeWorkflow);
  } catch {
    return seedWorkflows();
  }
}

function write(list: EventWorkflow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function readTransitions(): OfficerTransitionWorkflow[] {
  if (typeof window === "undefined") return seedTransitionWorkflows();
  try {
    const raw = localStorage.getItem(TRANSITION_KEY);
    if (!raw) {
      const seeded = seedTransitionWorkflows();
      localStorage.setItem(TRANSITION_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as OfficerTransitionWorkflow[];
  } catch {
    return seedTransitionWorkflows();
  }
}

function writeTransitions(list: OfficerTransitionWorkflow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRANSITION_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(TRANSITION_EVENT));
}

function cloneWorkflow(workflow: EventWorkflow) {
  return JSON.parse(JSON.stringify(workflow)) as EventWorkflow;
}

function updateWorkflow(id: string, updater: (workflow: EventWorkflow) => EventWorkflow) {
  const next = read().map((workflow) => (workflow.id === id ? normalizeWorkflow(updater(cloneWorkflow(workflow))) : workflow));
  write(next);
  return next.find((workflow) => workflow.id === id) ?? null;
}

function nextStageFor(status: WorkflowStatus) {
  switch (status) {
    case "draft":
      return "Planning";
    case "pending_adviser":
      return "Adviser approval";
    case "revision_requested":
      return "Leader revisions";
    case "pending_admin2":
      return "Admin 2 review";
    case "pending_admin1":
      return "Admin 1 approval";
    case "approved":
      return "Preparation";
    case "completed":
      return "Completed";
  }
}

function stageIndexFor(status: WorkflowStatus) {
  switch (status) {
    case "draft":
      return 0;
    case "pending_adviser":
    case "revision_requested":
      return 1;
    case "pending_admin2":
      return 2;
    case "pending_admin1":
      return 3;
    case "approved":
      return 4;
    case "completed":
      return 5;
  }
}

export function getWorkflowStages(status: WorkflowStatus) {
  const currentIndex = stageIndexFor(status);
  return [
    { id: "planning", label: "Planning", description: "Build the proposal form and draft the event scope." },
    { id: "adviser", label: "Adviser approval", description: "First review for content, officer readiness, and activity details." },
    { id: "admin2", label: "Admin 2 review", description: "Secondary compliance and monitoring check." },
    { id: "admin1", label: "Admin 1 approval", description: "Final university authority review." },
    { id: "prep", label: "Preparation", description: "Checklist, forms, and implementation readiness." },
    { id: "post", label: "Post-event", description: "Reflections, documentation, and final closeout." },
  ].map((stage, index) => ({
    ...stage,
    state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
  }));
}

export function getWorkflows() {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getWorkflow(id: string) {
  return read().find((workflow) => workflow.id === id) ?? null;
}

export function createWorkflow(input: {
  orgName: string;
  orgShort: string;
  createdBy: string;
  proposal: EventProposalData;
  submit?: boolean;
}) {
  const status: WorkflowStatus = input.submit ? "pending_adviser" : "draft";
  const workflow: EventWorkflow = normalizeWorkflow({
    id: nowId("workflow"),
    orgName: input.orgName,
    orgShort: input.orgShort,
    ay: currentAy(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: input.createdBy,
    ownerRole: "leader",
    status,
    currentStage: nextStageFor(status),
    proposal: input.proposal,
    operations: defaultOperations(input.proposal.title),
    comments: [],
    history: [
      {
        id: nowId("history"),
        action: "created",
        byRole: "leader",
        byName: input.createdBy,
        note: input.submit ? "Workflow created and submitted to adviser." : "Workflow draft created.",
        createdAt: Date.now(),
      },
    ],
  });
  const list = [workflow, ...read()];
  write(list);
  if (input.submit) {
    addNotification({
      title: `${workflow.proposal.title} is pending adviser approval`,
      meta: "Workflow routing started",
      category: "event",
      href: `/adviser/workflows/${workflow.id}`,
    });
  }
  return workflow;
}

export function saveWorkflowDraft(id: string, proposal: EventProposalData, actorName: string) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    proposal,
    updatedAt: Date.now(),
    history: [
      {
        id: nowId("history"),
        action: "draft_saved",
        byRole: "leader",
        byName: actorName,
        note: "Draft saved from the smart form builder.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function submitWorkflow(id: string, actor: WorkflowActor) {
  return updateWorkflow(id, (workflow) => {
    const status = "pending_adviser";
    addNotification({
      title: `${workflow.proposal.title} needs adviser review`,
      meta: "Pending adviser",
      category: "event",
      href: `/adviser/workflows/${workflow.id}`,
    });
    return {
      ...workflow,
      status,
      currentStage: nextStageFor(status),
      updatedAt: Date.now(),
      history: [
        {
          id: nowId("history"),
          action: workflow.status === "revision_requested" ? "resubmitted" : "submitted",
          byRole: actor.role,
          byName: actor.name,
          note: "Sent to adviser review.",
          createdAt: Date.now(),
        },
        ...workflow.history,
      ],
    };
  });
}

export function addWorkflowComment(
  id: string,
  actor: WorkflowActor,
  message: string,
  sectionId?: string,
) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    comments: [
      {
        id: nowId("comment"),
        authorRole: actor.role,
        authorName: actor.name,
        message,
        createdAt: Date.now(),
        sectionId,
      },
      ...workflow.comments,
    ],
    history: [
      {
        id: nowId("history"),
        action: "commented",
        byRole: actor.role,
        byName: actor.name,
        note: message,
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function requestWorkflowRevision(id: string, actor: WorkflowActor, note: string) {
  return updateWorkflow(id, (workflow) => {
    addNotification({
      title: `${workflow.proposal.title} needs revisions`,
      meta: `${actor.name} returned the workflow`,
      category: "event",
      href: `/leader/workflows/${workflow.id}`,
    });
    return {
      ...workflow,
      status: "revision_requested",
      currentStage: nextStageFor("revision_requested"),
      updatedAt: Date.now(),
      comments: [
        {
          id: nowId("comment"),
          authorRole: actor.role,
          authorName: actor.name,
          message: note,
          createdAt: Date.now(),
        },
        ...workflow.comments,
      ],
      history: [
        {
          id: nowId("history"),
          action: "revision_requested",
          byRole: actor.role,
          byName: actor.name,
          note,
          createdAt: Date.now(),
        },
        ...workflow.history,
      ],
    };
  });
}

export function approveWorkflow(id: string, actor: WorkflowActor, note?: string) {
  return updateWorkflow(id, (workflow) => {
    let nextStatus: WorkflowStatus = workflow.status;
    let href = "";
    if (actor.role === "adviser") {
      nextStatus = "pending_admin2";
      href = `/admin2/workflows/${workflow.id}`;
    } else if (actor.role === "admin2") {
      nextStatus = "pending_admin1";
      href = `/admin1/workflows/${workflow.id}`;
    } else if (actor.role === "admin1") {
      nextStatus = "approved";
      href = `/leader/workflows/${workflow.id}`;
    }

    addNotification({
      title: `${workflow.proposal.title} moved to ${nextStageFor(nextStatus)}`,
      meta: note ?? "Workflow updated",
      category: "event",
      href,
    });

    return {
      ...workflow,
      status: nextStatus,
      currentStage: nextStageFor(nextStatus),
      updatedAt: Date.now(),
      history: [
        {
          id: nowId("history"),
          action: "approved",
          byRole: actor.role,
          byName: actor.name,
          note: note ?? `Moved to ${nextStageFor(nextStatus)}.`,
          createdAt: Date.now(),
        },
        ...workflow.history,
      ],
    };
  });
}

export function toggleWorkflowChecklistItem(id: string, itemId: string, actor: WorkflowActor) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      preparationChecklist: workflow.operations.preparationChecklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: "Updated a preparation checklist item.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function setWorkflowFormReady(
  id: string,
  field: "requirementsTrackerReady" | "attendeeCollectionReady",
  value: boolean,
  actor: WorkflowActor,
) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      forms: {
        ...workflow.operations.forms,
        [field]: value,
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: `Marked ${field === "requirementsTrackerReady" ? "requirements tracker" : "attendance collection"} as ${value ? "ready" : "not ready"}.`,
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function updateWorkflowEventDay(
  id: string,
  actor: WorkflowActor,
  patch: Partial<WorkflowEventDayData>,
) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      eventDay: {
        ...workflow.operations.eventDay,
        ...patch,
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: "Updated event day metrics and logs.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function addWorkflowEventDayMedia(id: string, actor: WorkflowActor, name: string) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      eventDay: {
        ...workflow.operations.eventDay,
        mediaUploads: [...workflow.operations.eventDay.mediaUploads, name],
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: `Added event day media: ${name}.`,
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function addWorkflowParticipationLog(id: string, actor: WorkflowActor, entry: string) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      eventDay: {
        ...workflow.operations.eventDay,
        participationLogs: [...workflow.operations.eventDay.participationLogs, entry],
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: "Added a participation log entry.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function updateWorkflowPostEvent(
  id: string,
  actor: WorkflowActor,
  patch: Partial<WorkflowPostEventData>,
) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      postEvent: {
        ...workflow.operations.postEvent,
        ...patch,
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: "Updated post-event reporting fields.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function addWorkflowPostEventAsset(
  id: string,
  actor: WorkflowActor,
  field: "achievements" | "documentation",
  value: string,
) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    updatedAt: Date.now(),
    operations: {
      ...workflow.operations,
      postEvent: {
        ...workflow.operations.postEvent,
        [field]: [...workflow.operations.postEvent[field], value],
      },
    },
    history: [
      {
        id: nowId("history"),
        action: "operations_updated",
        byRole: actor.role,
        byName: actor.name,
        note: `Added ${field === "achievements" ? "achievement" : "documentation"} item.`,
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function markWorkflowCompleted(id: string, actor: WorkflowActor, note?: string) {
  return updateWorkflow(id, (workflow) => ({
    ...workflow,
    status: "completed",
    currentStage: nextStageFor("completed"),
    updatedAt: Date.now(),
    history: [
      {
        id: nowId("history"),
        action: "completed",
        byRole: actor.role,
        byName: actor.name,
        note: note ?? "Workflow marked complete.",
        createdAt: Date.now(),
      },
      ...workflow.history,
    ],
  }));
}

export function formatWorkflowStatus(status: WorkflowStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_adviser":
      return "Pending Adviser";
    case "revision_requested":
      return "Revision Requested";
    case "pending_admin2":
      return "Pending Admin 2";
    case "pending_admin1":
      return "Pending Admin 1";
    case "approved":
      return "Approved";
    case "completed":
      return "Completed";
  }
}

export function statusTone(status: WorkflowStatus): "neutral" | "warning" | "info" | "danger" | "success" {
  switch (status) {
    case "draft":
      return "neutral";
    case "pending_adviser":
      return "info";
    case "revision_requested":
      return "danger";
    case "pending_admin2":
    case "pending_admin1":
      return "warning";
    case "approved":
    case "completed":
      return "success";
  }
}

export function proposalCompletion(proposal: EventProposalData) {
  const checks = [
    proposal.title.trim(),
    proposal.category.trim(),
    proposal.objective.trim(),
    proposal.description.trim(),
    proposal.venue.trim(),
    proposal.date.trim(),
    proposal.time.trim(),
    proposal.collaborators.length > 0,
    proposal.sdgs.length > 0,
    proposal.budgetItems.length > 0,
    proposal.timeline.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  const total = checks.length;
  return {
    done,
    total,
    pct: Math.round((done / total) * 100),
  };
}

export function operationsCompletion(workflow: EventWorkflow) {
  const checklist = workflow.operations.preparationChecklist;
  const checklistDone = checklist.filter((item) => item.done).length;
  const checklistTotal = checklist.length || 1;
  const formsReady = Number(workflow.operations.forms.requirementsTrackerReady) + Number(workflow.operations.forms.attendeeCollectionReady);
  const logsReady = Number(workflow.operations.eventDay.participationLogs.length > 0) + Number(workflow.operations.eventDay.mediaUploads.length > 0);
  const postReady =
    Number(Boolean(workflow.operations.postEvent.reflection.trim())) +
    Number(Boolean(workflow.operations.postEvent.outcomes.trim())) +
    Number(workflow.operations.postEvent.achievements.length > 0) +
    Number(workflow.operations.postEvent.documentation.length > 0);
  const done = checklistDone + formsReady + logsReady + postReady;
  const total = checklistTotal + 2 + 2 + 4;
  return {
    done,
    total,
    pct: Math.round((done / total) * 100),
    checklistDone,
    checklistTotal,
  };
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useWorkflows() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getWorkflows()),
    () => JSON.stringify(seedWorkflows()),
  );
  return hydrated ? (JSON.parse(snapshot) as EventWorkflow[]) : seedWorkflows();
}

export function useWorkflow(id: string) {
  return useWorkflows().find((workflow) => workflow.id === id) ?? null;
}

function nextTransitionStageFor(status: WorkflowStatus) {
  switch (status) {
    case "draft":
      return "Nomination draft";
    case "pending_adviser":
      return "Adviser validation";
    case "revision_requested":
      return "Leader revisions";
    case "pending_admin1":
      return "Admin 1 approval";
    case "approved":
      return "Approved and ready to archive";
    case "completed":
      return "Archived";
    case "pending_admin2":
      return "Admin 2 review";
  }
}

export function getTransitionWorkflows() {
  return readTransitions().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getTransitionWorkflow(id: string) {
  return readTransitions().find((workflow) => workflow.id === id) ?? null;
}

export function createTransitionWorkflow(input: {
  orgName: string;
  orgShort: string;
  submittedBy: string;
  adviserName: string;
  academicYear: string;
  rationale: string;
  handoverNotes: string;
  nominees: OfficerNominee[];
}) {
  const workflow: OfficerTransitionWorkflow = {
    id: nowId("transition"),
    orgName: input.orgName,
    orgShort: input.orgShort,
    submittedBy: input.submittedBy,
    academicYear: input.academicYear,
    status: "pending_adviser",
    currentStage: nextTransitionStageFor("pending_adviser"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    adviserName: input.adviserName,
    nominees: input.nominees,
    rationale: input.rationale,
    handoverNotes: input.handoverNotes,
    comments: [],
    history: [
      {
        id: nowId("history"),
        action: "created",
        byRole: "leader",
        byName: input.submittedBy,
        note: "Officer transition workflow created.",
        createdAt: Date.now(),
      },
      {
        id: nowId("history"),
        action: "submitted",
        byRole: "leader",
        byName: input.submittedBy,
        note: "Submitted to adviser for validation.",
        createdAt: Date.now(),
      },
    ],
    archivedOfficers: [],
  };
  writeTransitions([workflow, ...readTransitions()]);
  addNotification({
    title: `${workflow.orgShort} officer transition is pending adviser review`,
    meta: "Officer transition workflow",
    category: "general",
    href: `/adviser/transitions/${workflow.id}`,
  });
  return workflow;
}

export function addTransitionComment(id: string, actor: WorkflowActor, message: string) {
  const next = readTransitions().map((workflow) =>
    workflow.id === id
      ? {
          ...workflow,
          updatedAt: Date.now(),
          comments: [
            {
              id: nowId("comment"),
              authorRole: actor.role,
              authorName: actor.name,
              message,
              createdAt: Date.now(),
            },
            ...workflow.comments,
          ],
          history: [
            {
              id: nowId("history"),
              action: "commented",
              byRole: actor.role,
              byName: actor.name,
              note: message,
              createdAt: Date.now(),
            },
            ...workflow.history,
          ],
        }
      : workflow,
  );
  writeTransitions(next);
}

export function requestTransitionRevision(id: string, actor: WorkflowActor, note: string) {
  const next = readTransitions().map((workflow) =>
    workflow.id === id
      ? {
          ...workflow,
          status: "revision_requested" as WorkflowStatus,
          currentStage: nextTransitionStageFor("revision_requested"),
          updatedAt: Date.now(),
          comments: [
            {
              id: nowId("comment"),
              authorRole: actor.role,
              authorName: actor.name,
              message: note,
              createdAt: Date.now(),
            },
            ...workflow.comments,
          ],
          history: [
            {
              id: nowId("history"),
              action: "revision_requested",
              byRole: actor.role,
              byName: actor.name,
              note,
              createdAt: Date.now(),
            },
            ...workflow.history,
          ],
        }
      : workflow,
  );
  writeTransitions(next);
  const workflow = next.find((item) => item.id === id);
  if (workflow) {
    addNotification({
      title: `${workflow.orgShort} officer transition needs revisions`,
      meta: actor.name,
      category: "general",
      href: `/leader/officer-transition/${workflow.id}`,
    });
  }
}

export function approveTransitionWorkflow(id: string, actor: WorkflowActor, note?: string) {
  const next = readTransitions().map((workflow) => {
    if (workflow.id !== id) return workflow;
    if (actor.role === "adviser") {
      return {
        ...workflow,
        status: "pending_admin1" as WorkflowStatus,
        currentStage: nextTransitionStageFor("pending_admin1"),
        updatedAt: Date.now(),
        history: [
          {
            id: nowId("history"),
            action: "approved",
            byRole: actor.role,
            byName: actor.name,
            note: note ?? "Validated officer nominees and forwarded to Admin 1.",
            createdAt: Date.now(),
          },
          ...workflow.history,
        ],
      };
    }
    if (actor.role === "admin1") {
      const previous = workflow.archivedOfficers.at(-1);
      const archive: OfficerRecord = {
        id: nowId("archive"),
        academicYear: workflow.academicYear,
        officers: workflow.nominees,
        archivedAt: Date.now(),
        approvedBy: actor.name,
      };
      return {
        ...workflow,
        status: "completed" as WorkflowStatus,
        currentStage: nextTransitionStageFor("completed"),
        updatedAt: Date.now(),
        archivedOfficers: previous ? [...workflow.archivedOfficers, archive] : [...workflow.archivedOfficers, archive],
        history: [
          {
            id: nowId("history"),
            action: "completed",
            byRole: actor.role,
            byName: actor.name,
            note: note ?? "Approved officer transition and archived previous roster.",
            createdAt: Date.now(),
          },
          ...workflow.history,
        ],
      };
    }
    return workflow;
  });
  writeTransitions(next);
  const workflow = next.find((item) => item.id === id);
  if (!workflow) return;
  addNotification({
    title:
      actor.role === "adviser"
        ? `${workflow.orgShort} officer transition is pending Admin 1`
        : `${workflow.orgShort} officer transition archived successfully`,
    meta: note ?? "Officer transition workflow updated",
    category: "general",
    href: actor.role === "adviser" ? `/admin1/transitions/${workflow.id}` : `/leader/officer-transition/${workflow.id}`,
  });
}

function subscribeTransitions(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(TRANSITION_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(TRANSITION_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useTransitionWorkflows() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribeTransitions,
    () => JSON.stringify(getTransitionWorkflows()),
    () => JSON.stringify(seedTransitionWorkflows()),
  );
  return hydrated ? (JSON.parse(snapshot) as OfficerTransitionWorkflow[]) : seedTransitionWorkflows();
}

export function useTransitionWorkflow(id: string) {
  return useTransitionWorkflows().find((workflow) => workflow.id === id) ?? null;
}
