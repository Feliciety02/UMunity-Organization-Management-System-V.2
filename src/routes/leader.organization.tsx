import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge, StatCard } from "@/components/dashboard/DashboardLayout";
import { Users, Calendar, Award, Heart, Plus, Target, Eye, X } from "lucide-react";

export const Route = createFileRoute("/leader/organization")({
  component: Org,
});

function Org() {
  const [coreValues, setCoreValues] = useState([
    "Innovation",
    "Leadership",
    "Collaboration",
  ]);

  function addCoreValue() {
    setCoreValues((current) => [...current, ""]);
  }

  function updateCoreValue(index: number, value: string) {
    setCoreValues((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeCoreValue(index: number) {
    setCoreValues((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <>
      <PageHead
        title="My organization"
        sub="Manage UM Computer Studies Society profile and identity."
        action={<button className="rounded-full bg-gradient-maroon px-5 py-2 text-xs font-semibold text-primary-foreground">Save changes</button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-maroon">
            <div className="absolute inset-0 bg-hero opacity-50" />
          </div>
          <div className="-mt-10 flex items-end gap-4 px-2">
            <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary-deep font-display text-2xl font-bold text-primary-foreground shadow-soft">
              CS
            </div>
            <div className="pb-2">
              <p className="font-display text-xl font-bold">UM Computer Studies Society</p>
              <p className="text-sm text-muted-foreground">Academic · 412 members</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Org name</span>
              <input defaultValue="UM Computer Studies Society" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
              <input defaultValue="Academic" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span>
              <textarea rows={3} defaultValue="The home of CS innovators, hackers, and future tech leaders at UM." className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
            </label>
          </div>
        </Panel>

        <div className="space-y-4">
          <StatCard label="Members" value="412" icon={Users} tone="primary" />
          <StatCard label="Events hosted" value="38" icon={Calendar} tone="gold" />
          <StatCard label="Awards" value="6" icon={Award} tone="rose" />
          <StatCard label="Community love" value="98%" icon={Heart} tone="emerald" />
        </div>
      </div>

      <Panel title="Mission, Vision, and Core Values" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="h-4 w-4" />
              Mission Statement
            </div>
            <textarea
              rows={5}
              defaultValue="To develop competent, innovative, and ethical computing professionals who contribute to the digital transformation of society."
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm"
            />
          </div>

          <div className="rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Eye className="h-4 w-4" />
              Vision Statement
            </div>
            <textarea
              rows={5}
              defaultValue="To be the leading student organization in computer studies recognized for excellence in education, leadership, and innovation."
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Core Values</p>
              <p className="text-xs text-muted-foreground">Add values that define how your organization leads and works together.</p>
            </div>
            <button
              type="button"
              onClick={addCoreValue}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary transition hover:bg-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Core Value
            </button>
          </div>

          <div className="space-y-3">
            {coreValues.map((value, index) => (
              <div key={`${index}-${value}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3">
                <Badge tone="gold">Value {index + 1}</Badge>
                <input
                  value={value}
                  onChange={(event) => updateCoreValue(index, event.target.value)}
                  placeholder="Enter a core value"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                {coreValues.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeCoreValue(index)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    aria-label={`Remove core value ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Officers" className="mt-6">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "Marco Reyes", r: "President" },
            { n: "Anna Sy", r: "Vice President" },
            { n: "Karl Mendez", r: "Secretary" },
            { n: "Jules Tan", r: "Treasurer" },
            { n: "Pia Lim", r: "PRO" },
            { n: "Prof. Tan", r: "Adviser" },
          ].map((o) => (
            <div key={o.n} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-primary text-xs font-bold text-primary-foreground">
                {o.n.split(" ").map((w) => w[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold">{o.n}</p>
                <p className="text-xs text-muted-foreground">{o.r}</p>
              </div>
              <Badge tone="success">Active</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
