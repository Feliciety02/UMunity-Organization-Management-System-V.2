import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { organizations } from "@/data/site";
import umOrganizationsHero from "@/assets/um-organizations-hero.svg";
import { ArrowRight, ArrowUpDown, Search, SlidersHorizontal, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — UMunity" },
      {
        name: "description",
        content:
          "Discover and join recognized student organizations at the University of Mindanao.",
      },
      { property: "og:title", content: "Organizations — UMunity" },
      {
        property: "og:description",
        content:
          "Discover and join recognized student organizations at the University of Mindanao.",
      },
    ],
  }),
  component: Orgs,
});

function Orgs() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"Popular" | "A-Z">("Popular");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(organizations.map((o) => o.category)))],
    [],
  );
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
    <PageShell overlayHeader>
      <section className="hero-section relative left-1/2 flex min-h-[88vh] w-screen max-w-none -translate-x-1/2 items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${umOrganizationsHero})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(75,0,16,0.9)_0%,rgba(75,0,16,0.72)_34%,rgba(75,0,16,0.48)_68%,rgba(20,6,9,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,199,44,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.11),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.18))]" />
        <div className="absolute -left-16 top-28 h-72 w-72 rounded-full bg-[rgba(244,176,0,0.12)] blur-3xl" />
        <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-[rgba(122,0,25,0.22)] blur-3xl" />

        <div className="hero-content relative mx-auto flex w-full max-w-[1400px] px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center text-[#FFFDF7]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC72C] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" />
              Discover Campus Communities
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Explore{" "}
              <span className="bg-[linear-gradient(180deg,#FFC72C_0%,#F4B000_100%)] bg-clip-text text-transparent">
                Organizations
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#FFFDF7]/78 sm:text-xl">
              120+ recognized communities. Find the one that feels like home, meet students who
              share your goals, and step into campus life with confidence.
            </p>

            <div className="mx-auto mt-9 flex w-full max-w-3xl items-center gap-3 rounded-[1.75rem] border border-white/14 bg-[rgba(255,255,255,0.10)] px-4 py-3 shadow-[0_20px_50px_rgba(25,7,10,0.28)] backdrop-blur-2xl">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(255,255,255,0.10)] text-[#FFFDF7]/78">
                <Search className="h-5 w-5" />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search organizations, interests, and student communities..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-[#FFFDF7] placeholder:text-[#FFFDF7]/58 focus:outline-none sm:text-base"
              />
              <div className="hidden items-center gap-2 rounded-full border border-white/14 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-semibold text-[#FFFDF7]/74 md:inline-flex">
                <Users className="h-4 w-4 text-[#FFC72C]" />
                {filtered.length} visible
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-[#FFFDF7]/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[rgba(255,255,255,0.08)] px-4 py-2 backdrop-blur-xl">
                <Users className="h-4 w-4 text-[#FFC72C]" />
                Academic, service, arts, and tech communities
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[rgba(255,255,255,0.08)] px-4 py-2 backdrop-blur-xl">
                Start exploring
                <ArrowRight className="h-4 w-4 text-[#FFC72C]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-[rgba(122,0,25,0.08)] bg-[linear-gradient(180deg,rgba(255,253,247,0.98),rgba(255,250,242,0.95))] p-5 shadow-[0_22px_60px_rgba(75,0,16,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Public discovery
              </div>
              <button
                type="button"
                onClick={() => setSort((current) => (current === "Popular" ? "A-Z" : "Popular"))}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                Sort: {sort}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={`${c}-count`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  cat === c
                    ? "bg-[rgba(122,0,25,0.08)] text-primary"
                    : "bg-secondary/70 text-muted-foreground"
                }`}
              >
                {c === "All"
                  ? `${organizations.length} total`
                  : `${organizations.filter((o) => o.category === c).length} orgs`}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            organizations
            {cat !== "All" ? (
              <>
                {" "}
                in <span className="font-semibold text-foreground">{cat}</span>
              </>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
              Sorted by {sort === "Popular" ? "member count" : "name"}
            </span>
            {q.trim() ? (
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                Search: {q.trim()}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <article
              key={o.slug}
              className="group overflow-hidden rounded-[28px] border border-border bg-card shadow-soft transition duration-200 hover:-translate-y-1"
            >
              <div className={`relative h-44 bg-gradient-to-br ${coverTone[o.slug] ?? o.color}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.12))]" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
                <span className="absolute left-5 top-5 inline-flex rounded-full bg-card/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-deep backdrop-blur">
                  {o.category}
                </span>
                <div className="absolute -bottom-7 left-6 z-10 grid h-16 w-16 place-items-center rounded-[20px] border-4 border-card bg-card shadow-soft">
                  <div
                    className={`grid h-full w-full place-items-center rounded-2xl bg-gradient-to-br ${o.color} font-display text-lg font-bold text-primary-foreground`}
                  >
                    {o.initials}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">
                      {o.name}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {o.desc}
                    </p>
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
                    View details
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-primary-deep transition hover:brightness-95"
                  >
                    Join UMunity
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">
              No organizations match your current search
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Try a broader keyword, switch categories, or clear your search to browse every
              recognized student community.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCat("All");
                  setSort("Popular");
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                Reset filters
              </button>
              <Link
                to="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-maroon px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageShell>
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
