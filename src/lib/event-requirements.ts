// Event Documentation Workflow store (demo, localStorage-backed)
// Generates an OSA-style Requirements Tracker per event.
import { useEffect, useState, useSyncExternalStore } from "react";
import { addNotification } from "./notifications";

export type ReqStatus = "pending" | "for-review" | "approved" | "missing";
export type SectionId = "before" | "during" | "after";

export type ReqFile = { name: string; size: number; uploadedAt: number };

export type ReqItem = {
  id: string;
  title: string;
  description?: string;
  template?: string; // suggested filename to download
  status: ReqStatus;
  files: ReqFile[];
  dueAt?: number; // ms
  note?: string;
};

export type ReqSection = {
  id: SectionId;
  title: string;
  blurb: string;
  items: ReqItem[];
};

export type EventDoc = {
  id: string;
  title: string;
  category: string;
  venue: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // HH:MM
  objectives: string;
  collaborators: string;
  orgShort: string; // for filenames, e.g. "UMCSS"
  ay: string; // e.g. "AY2025-2026"
  createdAt: number;
  sections: ReqSection[];
};

const KEY = "umunity.event-requirements.v1";
const EVENT = "umunity:event-requirements";

const DAY = 86_400_000;

export function academicYearFor(dateISO: string): string {
  const d = dateISO ? new Date(dateISO) : new Date();
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-11
  const start = m >= 5 ? y : y - 1; // AY starts June
  return `AY${start}-${start + 1}`;
}

export function suggestFilename(orgShort: string, eventTitle: string, item: string, ay: string) {
  const safeOrg = (orgShort || "ORG").replace(/[^A-Za-z0-9]/g, "");
  const safeTitle = (eventTitle || "Event").replace(/[^A-Za-z0-9]+/g, "");
  const safeItem = item.replace(/[^A-Za-z0-9]+/g, "");
  return `${safeOrg}_${safeTitle}_${safeItem}_${ay}.pdf`;
}

type Template = { id: string; title: string; description: string; template: string; offsetDays: number };

const BEFORE: Template[] = [
  { id: "activity-proposal", title: "Activity Proposal", description: "Concept paper, programme flow, and budget overview.", template: "ActivityProposal.docx", offsetDays: -21 },
  { id: "due-diligence", title: "Due Diligence", description: "Safety, venue clearance, and risk checklist.", template: "DueDiligence.docx", offsetDays: -18 },
  { id: "financial-due-diligence", title: "Financial Due Diligence", description: "Detailed budget breakdown and source of funds.", template: "FinancialDueDiligence.xlsx", offsetDays: -18 },
  { id: "letter-requests", title: "Letter Requests", description: "Permits, invitations, venue, and sponsor letters.", template: "LetterRequests.docx", offsetDays: -14 },
];

const DURING: Template[] = [
  { id: "attendance-sheet", title: "Attendance Sheet", description: "Printed sheet + digital tracker for sign-ins.", template: "AttendanceSheet.xlsx", offsetDays: 0 },
  { id: "documentation-reminder", title: "Documentation Reminder", description: "Assign documentor, ensure camera + storage ready.", template: "DocumentationChecklist.pdf", offsetDays: 0 },
  { id: "photo-coverage", title: "Photo Coverage Checklist", description: "Shotlist: opening, speakers, audience, awarding.", template: "PhotoChecklist.pdf", offsetDays: 0 },
  { id: "evaluation-forms", title: "Evaluation Forms", description: "Participant feedback and speaker rating sheets.", template: "EvaluationForm.docx", offsetDays: 0 },
  { id: "collaboration-forms", title: "Collaboration Forms", description: "Sign-off forms for partner orgs and sponsors.", template: "CollaborationForm.docx", offsetDays: 0 },
];

const AFTER: Template[] = [
  { id: "narrative-report", title: "Narrative Report", description: "Story of the event — objectives, flow, outcomes.", template: "NarrativeReport.docx", offsetDays: 7 },
  { id: "reflection-paper", title: "Reflection Paper", description: "Officer reflections and learnings.", template: "ReflectionPaper.docx", offsetDays: 7 },
  { id: "documentation-upload", title: "Documentation Upload", description: "Curated photo set and video highlights.", template: "DocumentationIndex.pdf", offsetDays: 10 },
  { id: "liquidation-report", title: "Liquidation Report", description: "Receipts, summary of expenses, balance.", template: "LiquidationReport.xlsx", offsetDays: 14 },
  { id: "awards-certificates", title: "Awards & Certificates", description: "Issued certificates for speakers and volunteers.", template: "CertificateList.xlsx", offsetDays: 10 },
  { id: "accreditation-requirements", title: "Accreditation Requirements", description: "Compile for OSA accreditation cycle.", template: "AccreditationPacket.pdf", offsetDays: 21 },
];

function buildSection(id: SectionId, title: string, blurb: string, templates: Template[], eventDate: string, orgShort: string, eventTitle: string, ay: string): ReqSection {
  const base = eventDate ? new Date(eventDate).getTime() : Date.now();
  return {
    id,
    title,
    blurb,
    items: templates.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      template: suggestFilename(orgShort, eventTitle, t.title, ay),
      status: "pending" as ReqStatus,
      files: [],
      dueAt: base + t.offsetDays * DAY,
    })),
  };
}

export function buildSections(eventDate: string, orgShort: string, eventTitle: string, ay: string): ReqSection[] {
  return [
    buildSection("before", "Before Event", "Plan, propose, and secure approvals.", BEFORE, eventDate, orgShort, eventTitle, ay),
    buildSection("during", "During Event", "Capture attendance, coverage, and feedback.", DURING, eventDate, orgShort, eventTitle, ay),
    buildSection("after", "After Event", "Report, liquidate, and prepare for accreditation.", AFTER, eventDate, orgShort, eventTitle, ay),
  ];
}

// ---------- storage ----------
const seed: EventDoc[] = [
  (() => {
    const date = "2026-05-24";
    const ay = academicYearFor(date);
    return {
      id: "evt-innovation-summit-2026",
      title: "UM Innovation Summit 2026",
      category: "Conference",
      venue: "DPT Building Auditorium",
      date,
      time: "09:00",
      objectives: "Showcase student innovation projects and connect students with industry mentors.",
      collaborators: "UM Eco Warriors, UM Debate Council",
      orgShort: "UMCSS",
      ay,
      createdAt: Date.now() - 14 * DAY,
      sections: buildSections(date, "UMCSS", "UM Innovation Summit 2026", ay).map((s) =>
        s.id === "before"
          ? { ...s, items: s.items.map((i, idx) => (idx < 2 ? { ...i, status: "approved" as ReqStatus } : idx === 2 ? { ...i, status: "for-review" as ReqStatus } : i)) }
          : s,
      ),
    };
  })(),
];

function read(): EventDoc[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as EventDoc[];
  } catch {
    return seed;
  }
}

function write(list: EventDoc[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function listEventDocs(): EventDoc[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getEventDoc(id: string): EventDoc | undefined {
  return read().find((e) => e.id === id);
}

export function createEventDoc(input: {
  title: string;
  category: string;
  venue: string;
  date: string;
  time: string;
  objectives: string;
  collaborators: string;
  orgShort?: string;
}): EventDoc {
  const ay = academicYearFor(input.date);
  const orgShort = input.orgShort || "UMORG";
  const id = `evt-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;
  const doc: EventDoc = {
    id,
    title: input.title,
    category: input.category,
    venue: input.venue,
    date: input.date,
    time: input.time,
    objectives: input.objectives,
    collaborators: input.collaborators,
    orgShort,
    ay,
    createdAt: Date.now(),
    sections: buildSections(input.date, orgShort, input.title, ay),
  };
  write([doc, ...read()]);
  addNotification({
    title: `Requirements tracker ready for ${input.title}`,
    meta: "Just now",
    category: "event",
    href: `/leader/requirements/${id}`,
  });
  return doc;
}

export function updateItemStatus(eventId: string, sectionId: SectionId, itemId: string, status: ReqStatus) {
  write(
    read().map((e) =>
      e.id !== eventId
        ? e
        : {
            ...e,
            sections: e.sections.map((s) =>
              s.id !== sectionId ? s : { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, status } : i)) },
            ),
          },
    ),
  );
}

export function uploadItemFile(eventId: string, sectionId: SectionId, itemId: string, file: { name: string; size: number }) {
  write(
    read().map((e) =>
      e.id !== eventId
        ? e
        : {
            ...e,
            sections: e.sections.map((s) =>
              s.id !== sectionId
                ? s
                : {
                    ...s,
                    items: s.items.map((i) =>
                      i.id !== itemId
                        ? i
                        : {
                            ...i,
                            files: [...i.files, { ...file, uploadedAt: Date.now() }],
                            status: i.status === "approved" ? i.status : ("for-review" as ReqStatus),
                          },
                    ),
                  },
            ),
          },
    ),
  );
}

export function removeItemFile(eventId: string, sectionId: SectionId, itemId: string, fileName: string) {
  write(
    read().map((e) =>
      e.id !== eventId
        ? e
        : {
            ...e,
            sections: e.sections.map((s) =>
              s.id !== sectionId
                ? s
                : { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, files: i.files.filter((f) => f.name !== fileName) } : i)) },
            ),
          },
    ),
  );
}

export function deleteEventDoc(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function computeProgress(doc: EventDoc): { done: number; total: number; pct: number; ready: boolean } {
  const all = doc.sections.flatMap((s) => s.items);
  const done = all.filter((i) => i.status === "approved").length;
  const total = all.length || 1;
  return { done, total, pct: Math.round((done / total) * 100), ready: done === total };
}

export function sectionProgress(section: ReqSection): { done: number; total: number; pct: number } {
  const total = section.items.length || 1;
  const done = section.items.filter((i) => i.status === "approved").length;
  return { done, total, pct: Math.round((done / total) * 100) };
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

export function useEventDocs(): EventDoc[] {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snap = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(listEventDocs()),
    () => JSON.stringify(seed),
  );
  return hydrated ? (JSON.parse(snap) as EventDoc[]) : seed;
}

export function useEventDoc(id: string): EventDoc | undefined {
  const docs = useEventDocs();
  return docs.find((e) => e.id === id);
}
