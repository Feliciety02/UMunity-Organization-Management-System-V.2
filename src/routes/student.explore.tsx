import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { organizations } from "@/data/site";
import { Search, Users } from "lucide-react";

export const Route = createFileRoute("/student/explore")({
  component: Explore,
});

function Explore() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(organizations.map((o) => o.category))], []);
  const filtered = organizations.filter(
    (o) => (cat === "All" || o.category === cat) && o.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHead title="Explore organizations" sub="Find communities that match your passions." />

      <Panel className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cat === c ? "bg-gradient-maroon text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/10"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((o) => (
          <div key={o.name} className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
            <div className="flex items-start justify-between">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${o.color} font-display text-base font-bold text-primary-foreground`}>
                {o.name.split(" ").filter((w) => w !== "UM").slice(0, 2).map((w) => w[0]).join("")}
              </div>
              <Badge>{o.category}</Badge>
            </div>
            <p className="mt-4 font-display text-base font-bold">{o.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> {o.members}</span>
              <button className="rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold text-primary-deep">Apply</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
