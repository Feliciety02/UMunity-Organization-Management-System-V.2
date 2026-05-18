import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, Tag, Target, ClipboardCheck } from "lucide-react";
import { createEventDoc } from "@/lib/event-requirements";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/create-event")({
  component: CreateEvent,
});

const CATEGORIES = ["Conference", "Workshop", "Competition", "Cultural", "Sports", "Community Outreach", "General Assembly", "Fundraiser"];

function orgShortFrom(name?: string) {
  if (!name) return "UMORG";
  const letters = name.replace(/[^A-Za-z\s]/g, "").split(/\s+/).map((w) => w[0]).join("").toUpperCase();
  return letters.length >= 2 ? letters.slice(0, 6) : "UMORG";
}

function CreateEvent() {
  const navigate = useNavigate();
  const session = typeof window !== "undefined" ? getSession() : null;
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    venue: "",
    date: "",
    time: "",
    objectives: "",
    collaborators: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function publish(asDraft = false) {
    if (!form.title.trim()) { toast.error("Add an event title to continue"); return; }
    if (!form.date) { toast.error("Pick an event date"); return; }
    const doc = createEventDoc({ ...form, orgShort: orgShortFrom(session?.org) });
    toast.success(asDraft ? "Saved as draft — Requirements Tracker ready" : "Event published — Requirements Tracker generated", {
      description: "Open the tracker to see auto-generated requirements, templates, and deadlines.",
    });
    navigate({ to: "/leader/requirements/$eventId", params: { eventId: doc.id } });
  }

  return (
    <>
      <PageHead
        title="Create event"
        sub="Plan, publish, and open RSVPs in minutes. UMUnity will auto-generate a Requirements Tracker for OSA paperwork."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event title</span>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Innovation Summit 2026"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Tag className="h-3 w-3" /> Category</span>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><MapPin className="h-3 w-3" /> Venue</span>
                <input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="DPT Building Auditorium"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Calendar className="h-3 w-3" /> Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" /> Time</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Target className="h-3 w-3" /> Objectives</span>
              <textarea
                rows={3}
                value={form.objectives}
                onChange={(e) => set("objectives", e.target.value)}
                placeholder="What are the goals of this event?"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Users className="h-3 w-3" /> Collaborators</span>
              <input
                value={form.collaborators}
                onChange={(e) => set("collaborators", e.target.value)}
                placeholder="Partner orgs, sponsors, units (comma-separated)"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" /> Click to upload event banner (PNG/JPG, ≤ 4MB)
            </label>
          </div>
        </Panel>

        <Panel title="Auto-generated tracker">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3 text-xs leading-5 text-foreground">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                After publishing, UMUnity creates a <strong>Requirements Tracker</strong> with OSA paperwork for
                <span className="font-semibold"> Before</span>, <span className="font-semibold">During</span>, and
                <span className="font-semibold"> After</span> the event — including templates, deadlines, and file naming.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>· Activity Proposal, Due Diligence, Letters</li>
              <li>· Attendance Sheet, Photo Coverage, Evaluation</li>
              <li>· Narrative, Liquidation, Accreditation</li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => publish(false)}
              className="w-full rounded-full bg-gradient-maroon py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-95"
            >
              Publish event
            </button>
            <button
              onClick={() => publish(true)}
              className="w-full rounded-full border border-border bg-card py-2.5 text-xs font-semibold transition hover:bg-secondary"
            >
              Save as draft
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              UMUnity does not replace OSA submissions.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
