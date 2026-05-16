import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { OrgCard } from "@/routes/index";
import { organizations } from "@/data/site";
import umOrganizationsHero from "@/assets/um-organizations-hero.svg";
import { Search, Users, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/organizations")({
  head: () => ({
    meta: [
      { title: "UMunity" },
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
              120+ recognized communities. Find the one that feels like home, meet students who share your goals, and step into campus life with confidence.
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> organizations
            {cat !== "All" ? (
              <>
                {" "}in <span className="font-semibold text-foreground">{cat}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => <OrgCard key={o.name} {...o} />)}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">No organizations match your search.</div>
        )}
      </section>
    </PageShell>
  );
}
