import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { OrgCard } from "@/routes/index";
import { organizations } from "@/data/site";
import { Search } from "lucide-react";

export const Route = createFileRoute("/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — UMUnity" },
      { name: "description", content: "Discover and join recognized student organizations at the University of Mindanao." },
    ],
  }),
  component: Orgs,
});

function Orgs() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(organizations.map(o => o.category)))], []);
  const filtered = organizations.filter(o =>
    (cat === "All" || o.category === cat) &&
    (q === "" || o.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-maroon py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold md:text-6xl">
            Explore <span className="text-gradient-gold">Organizations</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            120+ recognized communities. Find the one that feels like home.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white/10 p-2 backdrop-blur">
            <Search className="ml-3 h-4 w-4 text-primary-foreground/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search organizations..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                cat === c
                  ? "bg-gradient-maroon text-primary-foreground shadow-soft"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => <OrgCard key={o.name} {...o} />)}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">No organizations match your search.</div>
        )}
      </section>
    </PageShell>
  );
}
