import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { organizations, posts, officers, events } from "@/data/site";
import { PostCard, OrgAvatar } from "@/components/social/PostCard";
import { Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Users, Calendar, Mail, MapPin, Globe, UserPlus, Check, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/$slug")({
  component: OrgPage,
});

const tabs = ["Posts", "About", "Events", "Officers", "Photos"] as const;
type Tab = (typeof tabs)[number];

function OrgPage() {
  const { slug } = useParams({ from: "/org/$slug" });
  const org = organizations.find((o) => o.slug === slug);
  const [tab, setTab] = useState<Tab>("Posts");
  const [joined, setJoined] = useState(false);

  if (!org) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Organization not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The org you're looking for doesn't exist or was archived.</p>
          <Link to="/organizations" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Browse all orgs</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const orgPosts = posts.filter((p) => p.orgSlug === slug);
  const orgOfficers = officers[slug] ?? [];
  const orgEvents = events.filter((e) => e.host === org.name);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Cover */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <div className={`relative h-44 bg-gradient-to-br ${org.color} sm:h-60`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,176,0,0.3),transparent_55%)]" />
            <button className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white">
              <Camera className="h-3.5 w-3.5" /> Cover
            </button>
          </div>
          <div className="px-6 pb-5">
            <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-14">
              <div className="rounded-xl border-4 border-card bg-card">
                <OrgAvatar org={org} size={104} />
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{org.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge tone="gold">{org.category}</Badge>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {org.members} members</span>
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Open membership</span>
                </p>
              </div>
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => { setJoined((j) => !j); toast.success(joined ? "Left organization" : "Membership requested"); }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold ${joined ? "border border-border bg-card hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary-deep"}`}
                >
                  {joined ? <><Check className="h-3.5 w-3.5" /> Joined</> : <><UserPlus className="h-3.5 w-3.5" /> Join</>}
                </button>
                <button className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">Follow</button>
              </div>
            </div>

            <div className="-mb-px mt-5 flex gap-1 overflow-x-auto border-b border-border">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition ${tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                  {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-4">
            {tab === "Posts" && (
              orgPosts.length === 0
                ? <Panel><p className="text-center text-sm text-muted-foreground">No posts yet.</p></Panel>
                : orgPosts.map((p) => <PostCard key={p.id} post={p} org={org} />)
            )}

            {tab === "About" && (
              <Panel title="About">
                <p className="text-sm leading-relaxed">{org.desc}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> hello@{slug}.um.edu.ph</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> DPT Building, Room 204</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Established 2014</p>
                </div>
              </Panel>
            )}

            {tab === "Events" && (
              <Panel title="Upcoming events">
                {orgEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {orgEvents.map((e) => (
                      <li key={e.title} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.date} · {e.venue}</p>
                        </div>
                        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">RSVP</button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === "Officers" && (
              <Panel title="Officers">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(orgOfficers.length ? orgOfficers : [
                    { name: "President TBA", role: "President" },
                    { name: "VP TBA", role: "Vice President" },
                  ]).map((o) => (
                    <div key={o.name} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-xs font-bold text-primary-deep">
                        {o.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "Photos" && (
              <Panel title="Photos">
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6,7,8,9].map((i) => (
                    <div key={i} className={`aspect-square rounded-md bg-gradient-to-br ${i%2 ? org.color : "from-gold/40 to-primary/30"}`} />
                  ))}
                </div>
              </Panel>
            )}
          </div>

          <aside className="space-y-4">
            <Panel title="Quick info">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {org.members} members</li>
                <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Est. 2014</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> hello@{slug}.um.edu.ph</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Room 204, DPT Bldg</li>
              </ul>
            </Panel>

            <Panel title="Related orgs">
              <ul className="space-y-3">
                {organizations.filter((o) => o.slug !== slug && o.category === org.category).slice(0, 3).map((o) => (
                  <li key={o.slug}>
                    <Link to="/org/$slug" params={{ slug: o.slug }} className="flex items-center gap-3 rounded-md p-1.5 hover:bg-secondary">
                      <OrgAvatar org={o} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.members} members</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
