import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { getSession } from "@/lib/auth";
import { organizations, posts } from "@/data/site";
import { OrgAvatar } from "@/components/social/PostCard";
import { Modal, Field, TextArea, useToggle } from "@/components/social/Modal";
import { Pencil, Camera, MapPin, Mail, Link as LinkIcon, Calendar, Award, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/profile")({
  component: Profile,
});

const tabs = ["About", "Organizations", "Activity", "Events", "Badges"] as const;
type Tab = (typeof tabs)[number];

function Profile() {
  const s = getSession();
  const [tab, setTab] = useState<Tab>("About");
  const edit = useToggle();
  const photo = useToggle();

  const initials = s?.name.split(" ").slice(0, 2).map((w) => w[0]).join("") ?? "AD";
  const joined = organizations.slice(0, 3);

  return (
    <>
      {/* Cover + header */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <div className="relative h-44 bg-gradient-to-br from-primary-deep via-primary to-amber-700 sm:h-56">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(244,176,0,0.35),transparent_55%)]" />
          <button onClick={photo.on} className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/50">
            <Camera className="h-3.5 w-3.5" /> Edit cover
          </button>
        </div>
        <div className="relative px-6 pb-5">
          <div className="-mt-14 flex items-end gap-4 sm:-mt-16">
            <div className="relative">
              <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-primary-deep font-display text-3xl font-bold text-primary-foreground sm:h-32 sm:w-32">
                {initials}
              </div>
              <button onClick={photo.on} className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft hover:bg-secondary">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="font-display text-2xl font-bold leading-tight">{s?.name}</h1>
              <p className="text-sm text-muted-foreground">{s?.program}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="success">Verified UM Student</Badge>
                <Badge>3 Organizations</Badge>
                <Badge tone="gold">Top Contributor</Badge>
              </div>
            </div>
            <div className="hidden gap-2 pb-2 sm:flex">
              <button onClick={edit.on} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                <Pencil className="h-3.5 w-3.5" /> Edit profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="-mb-px mt-5 flex gap-1 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm font-semibold transition ${tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
                {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {tab === "About" && (
            <Panel title="About">
              <p className="text-sm leading-relaxed text-foreground/90">
                Third-year CS student passionate about open-source, accessible design, and campus-led tech for good.
                Currently building <span className="font-semibold">UMUnity</span> and helping organize the Innovation Summit.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Row icon={Mail} label={s?.email ?? ""} />
                <Row icon={MapPin} label="Davao City, Philippines" />
                <Row icon={Calendar} label="Joined March 2024" />
                <Row icon={LinkIcon} label="github.com/althea-dev" link />
              </div>
            </Panel>
          )}

          {tab === "Organizations" && (
            <Panel title="Joined organizations">
              <div className="grid gap-3 sm:grid-cols-2">
                {joined.map((o) => (
                  <div key={o.slug} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <OrgAvatar org={o} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.category}</p>
                    </div>
                    <Badge tone="success">Active</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === "Activity" && (
            <Panel title="Recent activity">
              <ul className="space-y-3">
                {[
                  { icon: Heart, text: "Liked a post from UM CS Society", time: "2h" },
                  { icon: MessageCircle, text: "Commented on Eco Warriors' Plastic-Free May recap", time: "1d" },
                  { icon: Calendar, text: "RSVP'd to UM Innovation Summit 2026", time: "2d" },
                  { icon: Award, text: "Earned the 'Active Member' badge", time: "1w" },
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-md p-2 hover:bg-secondary">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><a.icon className="h-4 w-4" /></div>
                    <p className="flex-1 text-sm">{a.text}</p>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {tab === "Events" && (
            <Panel title="Attended events">
              <ul className="divide-y divide-border">
                {[
                  { e: "Welcome Mixer 2026", date: "Apr 12" },
                  { e: "Coding Bootcamp Day 1", date: "Apr 22" },
                  { e: "Eco Cleanup Drive", date: "May 02" },
                ].map((a) => (
                  <li key={a.e} className="flex items-center justify-between py-3">
                    <p className="text-sm font-medium">{a.e}</p>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {tab === "Badges" && (
            <Panel title="Badges & achievements">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { t: "Active Member", d: "30+ days active" },
                  { t: "Volunteer", d: "5 community events" },
                  { t: "First Comment", d: "Joined the conversation" },
                ].map((b) => (
                  <div key={b.t} className="rounded-lg border border-border bg-card p-4 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-primary-deep">
                      <Award className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{b.t}</p>
                    <p className="text-xs text-muted-foreground">{b.d}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Posts feed */}
          <Panel title="Your activity feed">
            <div className="space-y-3">
              {posts.slice(0, 2).map((p) => (
                <div key={p.id} className="rounded-md border border-border bg-card p-3 text-sm">
                  <p className="text-xs text-muted-foreground">You liked · {p.time}</p>
                  <p className="mt-1 line-clamp-2">{p.content}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Intro">
            <ul className="space-y-2.5 text-sm">
              <Row icon={MapPin} label="Davao City" />
              <Row icon={Calendar} label="3rd Year · BS CS" />
              <Row icon={Mail} label={s?.email ?? ""} small />
              <Row icon={LinkIcon} label="@altheacodes" link />
            </ul>
          </Panel>

          <Panel title="Photos">
            <div className="grid grid-cols-3 gap-1.5">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className={`aspect-square rounded-md bg-gradient-to-br ${i%2 ? "from-primary/30 to-gold/30" : "from-gold/30 to-primary/30"}`} />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Edit profile modal */}
      <Modal
        open={edit.open}
        onClose={edit.off}
        title="Edit profile"
        footer={
          <>
            <button onClick={edit.off} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
            <button onClick={() => { edit.off(); toast.success("Profile updated"); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Save changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name" defaultValue={s?.name ?? ""} />
          <TextArea label="Bio" rows={3} defaultValue="Third-year CS student passionate about open-source, accessible design, and campus-led tech for good." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Course" defaultValue="BS Computer Science" />
            <Field label="Year level" defaultValue="3rd Year" />
            <Field label="UM Email" defaultValue={s?.email ?? ""} />
            <Field label="Phone" defaultValue="+63 917 ••• ••••" />
            <Field label="Twitter / X" defaultValue="@altheacodes" />
            <Field label="GitHub" defaultValue="althea-dev" />
          </div>
        </div>
      </Modal>

      <Modal open={photo.open} onClose={photo.off} title="Upload photo"
        footer={<>
          <button onClick={photo.off} className="rounded-md border border-border bg-card px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => { photo.off(); toast.success("Photo uploaded"); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Upload</button>
        </>}>
        <div className="flex h-44 flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/50 text-center">
          <Camera className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Drag a photo here</p>
          <p className="text-xs text-muted-foreground">or click to browse · max 5MB</p>
        </div>
      </Modal>
    </>
  );
}

function Row({ icon: Icon, label, link, small }: { icon: any; label: string; link?: boolean; small?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className={`${small ? "truncate" : ""} ${link ? "text-primary" : ""}`}>{label}</span>
    </li>
  );
}
