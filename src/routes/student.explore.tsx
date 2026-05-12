import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { organizations } from "@/data/site";
import { ArrowUpDown, ChevronRight, Search, SlidersHorizontal, Users } from "lucide-react";

export const Route = createFileRoute("/student/explore")({
  component: Explore,
});

function Explore() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"Popular" | "A-Z">("Popular");

  const cats = useMemo(() => ["All", ...new Set(organizations.map((o) => o.category))], []);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const next = organizations.filter((o) => {
      const matchesCategory = cat === "All" || o.category === cat;
      const matchesQuery =
        query === "" ||
        o.name.toLowerCase().includes(query) ||
        o.desc.toLowerCase().includes(query) ||
        o.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });

    return next.sort((a, b) => {
      if (sort === "A-Z") return a.name.localeCompare(b.name);
      return b.members - a.members;
    });
  }, [cat, q, sort]);

  return (
    <>
      <PageHead
        title="Explore Organizations"
        sub="Find communities that match your passions."
        breadcrumbs={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <span>Home</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Explore</span>
          </div>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSort((current) => (current === "Popular" ? "A-Z" : "Popular"))}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              Sort: {sort}
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Filters
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          {filtered.length} organizations
        </div>
        <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          Warm, student-first discovery
        </div>
      </div>

      <Panel className="mb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-full border border-border bg-background px-5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search organizations, interests, or categories"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded-full bg-secondary px-3 py-1.5">Discover</span>
              <span>Browse by community type</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-[#F4F1EA] text-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
        {filtered.map((o) => (
          <article
            key={o.slug}
            className="group overflow-hidden rounded-[28px] border border-border bg-card shadow-soft transition duration-200 hover:-translate-y-1"
          >
            <div className={`relative h-44 bg-gradient-to-br ${coverTone[o.slug] ?? o.color}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.12))]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
              <span className="absolute left-5 top-5 inline-flex rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-deep backdrop-blur">
                {o.category}
              </span>
              <div className="absolute -bottom-7 left-6 z-10 grid h-16 w-16 place-items-center rounded-[20px] border-4 border-card bg-white shadow-soft">
                <div className={`grid h-full w-full place-items-center rounded-2xl bg-gradient-to-br ${o.color} font-display text-lg font-bold text-primary-foreground`}>
                  {o.initials}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-10">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">{o.name}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{o.desc}</p>
                </div>
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  Active
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {o.members} members
                </span>
                <span>Recognized org</span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Link
                  to="/org/$slug"
                  params={{ slug: o.slug }}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  View
                </Link>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-primary-deep transition hover:brightness-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <Panel className="mt-6">
          <div className="py-12 text-center">
            <p className="text-base font-semibold text-foreground">No organizations match your current search.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a broader keyword or switch back to a wider category.</p>
          </div>
        </Panel>
      )}
    </>
  );
}

const coverTone: Record<string, string> = {
  "cs-society": "from-[#4B1020] via-[#7A0019] to-[#B3482C]",
  "debate-council": "from-[#5C121C] via-[#8C1D2A] to-[#D49A4A]",
  "eco-warriors": "from-[#1E4736] via-[#2A6A50] to-[#8AAE7B]",
  "theatre-guild": "from-[#5D2231] via-[#8E3147] to-[#D68B63]",
  "student-council": "from-[#53202B] via-[#7A0019] to-[#C98952]",
  athletics: "from-[#5B2B14] via-[#A84D1A] to-[#E0A44B]",
  "engineering-circle": "from-[#5F2A1D] via-[#8B3B28] to-[#D6A058]",
  "volunteer-corps": "from-[#5B1F26] via-[#7A0019] to-[#D08A65]",
};
