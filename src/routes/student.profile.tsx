import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Calendar, Camera, Heart, Link as LinkIcon, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHead, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { InfoCard } from "@/components/profile/info-card";
import { getSession } from "@/lib/auth";
import { organizations, posts } from "@/data/site";
import { OrgAvatar } from "@/components/social/PostCard";
import { Modal, Field, TextArea, useToggle } from "@/components/social/Modal";
import { toast } from "sonner";

export const Route = createFileRoute("/student/profile")({
  component: Profile,
});

const tabs = ["About", "Organizations", "Activity", "Events", "Badges"] as const;
type Tab = (typeof tabs)[number];

function Profile() {
  const session = getSession();
  const [tab, setTab] = useState<Tab>("About");
  const edit = useToggle();
  const photo = useToggle();

  const initials = session?.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("") ?? "AD";
  const joined = organizations.slice(0, 3);

  return (
    <>
      <PageHead title="My profile" sub="Manage your student profile and activity settings." />

      <div className="mx-auto max-w-[1180px]">
        <ProfileHeader
          initials={initials}
          name={session?.name ?? "Student"}
          subtitle={`${session?.program ?? "BS CS"} · 3rd Year`}
          tabs={tabs}
          tab={tab}
          onTabChange={setTab}
          badges={[
            { label: "Verified UM Student", tone: "success" },
            { label: "3 Organizations" },
            { label: "Top Contributor", tone: "gold" },
          ]}
          onEditCover={photo.on}
          onEditProfile={edit.on}
          onEditAvatar={photo.on}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
          <div className="space-y-6">
            {tab === "About" ? (
              <InfoCard title="About">
                <p className="text-sm leading-7 text-foreground/90">
                  Third-year CS student passionate about open-source, accessible design, and campus-led tech for good.
                  Currently building <span className="font-semibold">UMUnity</span> and helping organize the Innovation Summit.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Row icon={Mail} label={session?.email ?? ""} />
                  <Row icon={MapPin} label="Davao City, Philippines" />
                  <Row icon={Calendar} label="Joined March 2024" />
                  <Row icon={LinkIcon} label="github.com/althea-dev" link />
                </div>
              </InfoCard>
            ) : null}

            {tab === "Organizations" ? (
              <InfoCard title="Joined organizations">
                <div className="grid gap-3 sm:grid-cols-2">
                  {joined.map((org) => (
                    <div key={org.slug} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                      <OrgAvatar org={org} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.category}</p>
                      </div>
                      <Badge tone="success">Active</Badge>
                    </div>
                  ))}
                </div>
              </InfoCard>
            ) : null}

            {tab === "Activity" ? (
              <InfoCard title="Recent activity">
                <ul className="space-y-3">
                  {[
                    { icon: Heart, text: "Liked a post from UM CS Society", time: "2h" },
                    { icon: MessageCircle, text: "Commented on Eco Warriors' Plastic-Free May recap", time: "1d" },
                    { icon: Calendar, text: "RSVP'd to UM Innovation Summit 2026", time: "2d" },
                    { icon: Award, text: "Earned the 'Active Member' badge", time: "1w" },
                  ].map((activity) => (
                    <li key={activity.text} className="flex items-start gap-3 rounded-2xl border border-transparent p-3 transition hover:border-border hover:bg-secondary/60">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <p className="flex-1 text-sm leading-6">{activity.text}</p>
                      <span className="pt-0.5 text-xs text-muted-foreground">{activity.time}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            ) : null}

            {tab === "Events" ? (
              <InfoCard title="Attended events">
                <ul className="divide-y divide-border">
                  {[
                    { event: "Welcome Mixer 2026", date: "Apr 12" },
                    { event: "Coding Bootcamp Day 1", date: "Apr 22" },
                    { event: "Eco Cleanup Drive", date: "May 02" },
                  ].map((entry) => (
                    <li key={entry.event} className="flex items-center justify-between gap-4 py-4">
                      <p className="text-sm font-medium">{entry.event}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{entry.date}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            ) : null}

            {tab === "Badges" ? (
              <InfoCard title="Badges & achievements">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { title: "Active Member", desc: "30+ days active" },
                    { title: "Volunteer", desc: "5 community events" },
                    { title: "First Comment", desc: "Joined the conversation" },
                  ].map((badge) => (
                    <div key={badge.title} className="rounded-2xl border border-border bg-card p-5 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-primary-deep">
                        <Award className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold">{badge.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>
            ) : null}

            <InfoCard title="Your activity feed">
              <div className="space-y-3">
                {posts.slice(0, 2).map((post) => (
                  <div key={post.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
                    <p className="text-xs text-muted-foreground">You liked · {post.time}</p>
                    <p className="mt-2 line-clamp-2 leading-6">{post.content}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>

          <div className="space-y-6">
            <InfoCard title="Intro">
              <ul className="space-y-3 text-sm">
                <Row icon={MapPin} label="Davao City" />
                <Row icon={Calendar} label="3rd Year · BS CS" />
                <Row icon={Mail} label={session?.email ?? ""} small />
                <Row icon={LinkIcon} label="@altheacodes" link />
              </ul>
            </InfoCard>

            <InfoCard title="Photos">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className={`aspect-square rounded-2xl border border-border/60 bg-gradient-to-br ${
                      item % 2 ? "from-primary/30 to-gold/30" : "from-gold/30 to-primary/30"
                    }`}
                  />
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      <Modal
        open={edit.open}
        onClose={edit.off}
        title="Edit profile"
        footer={
          <>
            <AppButton onClick={edit.off} variant="secondary" shape="soft">
              Cancel
            </AppButton>
            <AppButton
              onClick={() => {
                edit.off();
                toast.success("Profile updated");
              }}
              variant="primary"
              shape="soft"
            >
              Save changes
            </AppButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name" defaultValue={session?.name ?? ""} />
          <TextArea
            label="Bio"
            rows={3}
            defaultValue="Third-year CS student passionate about open-source, accessible design, and campus-led tech for good."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Course" defaultValue="BS Computer Science" />
            <Field label="Year level" defaultValue="3rd Year" />
            <Field label="UM Email" defaultValue={session?.email ?? ""} />
            <Field label="Phone" defaultValue="+63 917 ••• ••••" />
            <Field label="Twitter / X" defaultValue="@altheacodes" />
            <Field label="GitHub" defaultValue="althea-dev" />
          </div>
        </div>
      </Modal>

      <Modal
        open={photo.open}
        onClose={photo.off}
        title="Upload photo"
        footer={
          <>
            <AppButton onClick={photo.off} variant="secondary" shape="soft">
              Cancel
            </AppButton>
            <AppButton
              onClick={() => {
                photo.off();
                toast.success("Photo uploaded");
              }}
              variant="primary"
              shape="soft"
            >
              Upload
            </AppButton>
          </>
        }
      >
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
