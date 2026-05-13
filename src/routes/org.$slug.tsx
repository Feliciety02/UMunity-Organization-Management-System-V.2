import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { organizations, posts, officers, events } from "@/data/site";
import { PostCard, OrgAvatar } from "@/components/social/PostCard";
import { Badge } from "@/components/dashboard/DashboardLayout";
import { AppCard } from "@/components/ui/app-card";
import { UnderlineTabs } from "@/components/ui/app-tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Users, Calendar, Mail, MapPin, Globe, UserPlus, Check } from "lucide-react";
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
          <p className="mt-2 text-sm text-muted-foreground">The org you&apos;re looking for doesn&apos;t exist or was archived.</p>
          <Link to="/organizations" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Browse all orgs
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const orgPosts = posts.filter((p) => p.orgSlug === slug);
  const orgOfficers = officers[slug] ?? [];
  const orgEvents = events.filter((e) => e.host === org.name);
  const relatedOrgs = organizations.filter((o) => o.slug !== slug && o.category === org.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-[24px] border border-[rgba(122,0,25,0.08)] bg-white shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
          <div className={`relative h-52 bg-gradient-to-br ${org.color} sm:h-64`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(244,176,0,0.22),transparent_32%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.10))]" />
          </div>

          <div className="relative bg-white px-5 pb-5 sm:px-6">
            <div className="flex flex-col gap-5 border-b border-border/80 pt-20 md:flex-row md:items-center md:justify-between md:pt-10">
              <div className="flex min-w-0 flex-col items-center gap-4 md:min-w-0 md:flex-1 md:flex-row md:items-center md:gap-5">
                <div className="relative md:-mt-20">
                  <div className={`grid h-[116px] w-[116px] place-items-center rounded-full border-[6px] border-white bg-gradient-to-br ${org.color} font-display text-[2rem] font-bold text-primary-foreground shadow-[0_14px_40px_rgba(17,17,17,0.16)] md:h-[124px] md:w-[124px] md:text-[2.2rem]`}>
                    {org.initials}
                  </div>
                </div>

                <div className="min-w-0 text-center md:text-left">
                  <h1 className="truncate font-display text-[1.7rem] font-bold leading-tight tracking-tight text-foreground md:text-[1.95rem]">
                    {org.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground md:justify-start">
                    <Badge tone="gold">{org.category}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {org.members} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      Open membership
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-end">
                <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setJoined((j) => !j);
                    toast.success(joined ? "Left organization" : "Membership requested");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    joined
                      ? "border border-border bg-white text-foreground hover:bg-secondary"
                      : "bg-primary text-primary-foreground hover:bg-primary-deep"
                  }`}
                >
                  {joined ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Joined
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      Join
                    </>
                  )}
                </button>
                <button className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary">
                  Follow
                </button>
              </div>
              </div>
            </div>

            <div className="mt-6 border-b border-border/80">
              <UnderlineTabs
                items={tabs}
                value={tab}
                onChange={setTab}
                className="w-full justify-between gap-0 sm:justify-around"
              />
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {tab === "Posts" ? (
              orgPosts.length === 0 ? (
                <FlatCard>
                  <p className="text-center text-sm text-muted-foreground">No posts yet.</p>
                </FlatCard>
              ) : (
                orgPosts.map((p) => <PostCard key={p.id} post={p} org={org} />)
              )
            ) : null}

            {tab === "About" ? (
              <FlatCard title="About">
                <p className="text-sm leading-7 text-foreground/90">{org.desc}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoItem icon={Mail} label={`hello@${slug}.um.edu.ph`} />
                  <InfoItem icon={MapPin} label="DPT Building, Room 204" />
                  <InfoItem icon={Calendar} label="Established 2014" />
                  <InfoItem icon={Globe} label="Public organization page" />
                </div>
              </FlatCard>
            ) : null}

            {tab === "Events" ? (
              <FlatCard title="Events">
                {orgEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  <div className="space-y-3">
                    {orgEvents.map((e) => (
                      <div key={e.title} className="rounded-[18px] border border-border/70 bg-[#fafafb] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{e.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{e.date} · {e.time}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{e.venue}</p>
                          </div>
                          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-deep">
                            RSVP
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FlatCard>
            ) : null}

            {tab === "Officers" ? (
              <FlatCard title="Officers">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(orgOfficers.length
                    ? orgOfficers
                    : [
                        { name: "President TBA", role: "President" },
                        { name: "VP TBA", role: "Vice President" },
                      ]).map((o) => (
                    <div key={o.name} className="flex items-center gap-3 rounded-[18px] border border-border/70 bg-[#fafafb] p-4">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-xs font-bold text-primary-deep">
                        {o.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FlatCard>
            ) : null}

            {tab === "Photos" ? (
              <FlatCard title="Photos">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-[18px] border border-border/60 bg-gradient-to-br ${
                        i % 2 ? org.color : "from-gold/40 to-primary/30"
                      }`}
                    />
                  ))}
                </div>
              </FlatCard>
            ) : null}
          </div>

          <aside className="space-y-4">
            <FlatCard title="Quick info">
              <ul className="space-y-3 text-sm">
                <InfoItem icon={Users} label={`${org.members} members`} asList />
                <InfoItem icon={Calendar} label="Established 2014" asList />
                <InfoItem icon={Mail} label={`hello@${slug}.um.edu.ph`} asList />
                <InfoItem icon={MapPin} label="Room 204, DPT Building" asList />
              </ul>
            </FlatCard>

            <FlatCard title="Related organizations">
              <ul className="space-y-2">
                {relatedOrgs.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to="/org/$slug"
                      params={{ slug: item.slug }}
                      className="flex items-center gap-3 rounded-[16px] px-2 py-2 transition hover:bg-secondary"
                    >
                      <OrgAvatar org={item} size={40} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.members} members</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </FlatCard>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FlatCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <AppCard className="rounded-[20px] border border-border/80 bg-white shadow-[0_6px_16px_rgba(17,24,39,0.04)]">
      {title ? <h2 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h2> : null}
      {children}
    </AppCard>
  );
}

function InfoItem({
  icon: Icon,
  label,
  asList,
}: {
  icon: typeof Users;
  label: string;
  asList?: boolean;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-foreground/85">{label}</span>
    </>
  );

  if (asList) return <li className="flex items-center gap-2">{content}</li>;

  return <div className="flex items-center gap-2 rounded-[16px] border border-border/70 bg-[#fafafb] px-4 py-3">{content}</div>;
}
