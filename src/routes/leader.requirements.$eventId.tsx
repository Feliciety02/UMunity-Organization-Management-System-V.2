import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { toast } from "sonner";
import {
  ArrowLeft, CalendarDays, MapPin, Download, Upload, CheckCircle2, Clock, AlertCircle,
  FileText, X, Sparkles, Trash2, Users,
} from "lucide-react";
import {
  useEventDoc, updateItemStatus, uploadItemFile, removeItemFile, deleteEventDoc,
  computeProgress, sectionProgress, suggestFilename,
  type ReqStatus, type ReqItem, type ReqSection, type SectionId, type EventDoc,
} from "@/lib/event-requirements";

export const Route = createFileRoute("/leader/requirements/$eventId")({
  component: RequirementsTracker,
});

const STATUSES: { value: ReqStatus; label: string; tone: "neutral" | "warning" | "success" | "danger" | "info" }[] = [
  { value: "pending", label: "Pending", tone: "neutral" },
  { value: "for-review", label: "For Review", tone: "info" },
  { value: "approved", label: "Approved", tone: "success" },
  { value: "missing", label: "Missing", tone: "danger" },
];

function statusMeta(s: ReqStatus) {
  return STATUSES.find((x) => x.value === s) ?? STATUSES[0];
}

function dueLabel(due?: number): { text: string; tone: "neutral" | "warning" | "danger" | "success" } {
  if (!due) return { text: "No deadline", tone: "neutral" };
  const diff = due - Date.now();
  const days = Math.round(diff / 86_400_000);
  if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, tone: "danger" };
  if (days === 0) return { text: "Due today", tone: "warning" };
  if (days <= 3) return { text: `Due in ${days}d`, tone: "warning" };
  if (days <= 14) return { text: `Due in ${days}d`, tone: "neutral" };
  return { text: `Due in ${days}d`, tone: "success" };
}

function RequirementsTracker() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const doc = useEventDoc(eventId);
  const [activeSection, setActiveSection] = useState<SectionId | "all">("all");

  const progress = useMemo(() => (doc ? computeProgress(doc) : { done: 0, total: 1, pct: 0, ready: false }), [doc]);

  if (!doc) {
    return (
      <>
        <PageHead title="Requirements" sub="Event not found." />
        <Panel>
          <div className="grid place-items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">This event tracker doesn't exist or has been removed.</p>
            <AppButton asChild variant="secondary">
              <Link to="/leader/requirements"><ArrowLeft className="h-4 w-4" /> Back to trackers</Link>
            </AppButton>
          </div>
        </Panel>
      </>
    );
  }

  const sections = activeSection === "all" ? doc.sections : doc.sections.filter((s) => s.id === activeSection);

  return (
    <>
      <PageHead
        title={doc.title}
        sub={`${doc.category || "Event"} · ${doc.date || "TBA"}${doc.time ? ` · ${doc.time}` : ""} · ${doc.venue || "Venue TBA"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="ghost">
              <Link to="/leader/requirements"><ArrowLeft className="h-4 w-4" /> All trackers</Link>
            </AppButton>
            <AppButton
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this event tracker? This won't affect any OSA submissions.")) {
                  deleteEventDoc(doc.id);
                  toast.success("Tracker deleted");
                  navigate({ to: "/leader/requirements" });
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </AppButton>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall progress</p>
              <p className="mt-1 font-display text-3xl font-bold">{progress.pct}%</p>
              <p className="mt-1 text-sm text-muted-foreground">{progress.done} of {progress.total} requirements approved</p>
            </div>
            {progress.ready ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Ready for Official Submission</p>
                  <p className="text-xs opacity-80">All items approved. Hand off to OSA via your usual channel.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                UMUnity does <strong className="text-foreground">not</strong> submit on your behalf — it only helps you prepare.
              </div>
            )}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full ${progress.ready ? "bg-emerald-500" : "bg-gradient-gold"}`}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </Panel>

        <Panel title="Event details">
          <dl className="space-y-2 text-sm">
            <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="sr-only">Date</dt><dd>{doc.date || "TBA"}{doc.time ? ` · ${doc.time}` : ""}</dd></div></div>
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><dt className="sr-only">Venue</dt><dd>{doc.venue || "Venue TBA"}</dd></div></div>
            {doc.collaborators ? <div className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-muted-foreground" /><dd>{doc.collaborators}</dd></div> : null}
            {doc.objectives ? <div className="rounded-xl bg-secondary/40 p-3 text-xs leading-5 text-muted-foreground">{doc.objectives}</div> : null}
            <div className="pt-1 text-xs text-muted-foreground">Naming convention: <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">{doc.orgShort}_{doc.title.replace(/[^A-Za-z0-9]+/g, "")}_…_{doc.ay}.pdf</code></div>
          </dl>
        </Panel>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "before", "during", "after"] as const).map((id) => {
          const active = activeSection === id;
          const label = id === "all" ? "All sections" : id === "before" ? "Before" : id === "during" ? "During" : "After";
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-6">
        {sections.map((section) => (
          <SectionBoard key={section.id} doc={doc} section={section} />
        ))}
      </div>
    </>
  );
}

function SectionBoard({ doc, section }: { doc: EventDoc; section: ReqSection }) {
  const p = sectionProgress(section);
  const icon = section.id === "before" ? Clock : section.id === "during" ? AlertCircle : CheckCircle2;
  const Icon = icon;
  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-lg font-semibold">{section.title}</h2>
            <p className="text-xs text-muted-foreground">{section.blurb}</p>
          </div>
        </div>
        <div className="flex min-w-[180px] items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-gradient-gold" style={{ width: `${p.pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{p.done}/{p.total}</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {section.items.map((item) => (
          <RequirementCard key={item.id} doc={doc} section={section} item={item} />
        ))}
      </div>
    </Panel>
  );
}

function RequirementCard({ doc, section, item }: { doc: EventDoc; section: ReqSection; item: ReqItem }) {
  const meta = statusMeta(item.status);
  const due = dueLabel(item.dueAt);
  const fileInput = useRef<HTMLInputElement>(null);
  const suggested = item.template || suggestFilename(doc.orgShort, doc.title, item.title, doc.ay);

  function cycleStatus() {
    const order: ReqStatus[] = ["pending", "for-review", "approved", "missing"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    updateItemStatus(doc.id, section.id, item.id, next);
    toast.success(`Marked as ${statusMeta(next).label}`);
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f) => uploadItemFile(doc.id, section.id, item.id, { name: f.name, size: f.size }));
    toast.success(`Uploaded ${files.length} file${files.length === 1 ? "" : "s"} for ${item.title}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{item.title}</h3>
          {item.description ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p> : null}
        </div>
        <button
          onClick={cycleStatus}
          title="Click to update status"
          className="shrink-0"
          aria-label={`Change status (currently ${meta.label})`}
        >
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 ${
          due.tone === "danger" ? "bg-rose-500/10 text-rose-600" :
          due.tone === "warning" ? "bg-amber-500/10 text-amber-700" :
          due.tone === "success" ? "bg-emerald-500/10 text-emerald-700" : "bg-secondary text-muted-foreground"
        }`}>{due.text}</span>
        <span className="truncate text-muted-foreground" title={suggested}>
          <FileText className="-mt-0.5 mr-1 inline h-3 w-3" />{suggested}
        </span>
      </div>

      {item.files.length > 0 ? (
        <ul className="space-y-1 rounded-xl bg-secondary/40 p-2 text-xs">
          {item.files.map((f) => (
            <li key={f.name} className="flex items-center justify-between gap-2">
              <span className="truncate"><FileText className="-mt-0.5 mr-1 inline h-3 w-3" />{f.name} <span className="text-muted-foreground">({Math.max(1, Math.round(f.size / 1024))} KB)</span></span>
              <button
                onClick={() => { removeItemFile(doc.id, section.id, item.id, f.name); toast.success("File removed"); }}
                className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-rose-100 hover:text-rose-600"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2">
        <button
          onClick={() => toast.info(`Template "${suggested}" would download here`, { description: "Template library is a placeholder in this demo." })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition hover:bg-secondary"
        >
          <Download className="h-3.5 w-3.5" /> Template
        </button>
        <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
        <button
          onClick={() => fileInput.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Upload className="h-3.5 w-3.5" /> Upload draft
        </button>
      </div>
    </div>
  );
}
