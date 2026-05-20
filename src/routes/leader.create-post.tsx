import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Image as ImageIcon, Globe, Lock, Pin, Calendar, Megaphone, FileText } from "lucide-react";
import { showStatusToast } from "@/lib/feedback";
import { createPostApproval } from "@/lib/post-approvals";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/leader/create-post")({
  component: CreatePost,
});

function CreatePost() {
  const navigate = useNavigate();
  const session = getSession();
  const [type, setType] = useState<"general" | "announcement" | "event">("general");
  const [visibility, setVisibility] = useState<"public" | "members">("public");
  const [pin, setPin] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageLabel, setImageLabel] = useState("");

  const typeOpts = [
    { id: "general", label: "General", icon: FileText },
    { id: "announcement", label: "Announcement", icon: Megaphone },
    { id: "event", label: "Event", icon: Calendar },
  ] as const;

  function submit(asDraft = false) {
    if (!content.trim()) {
      showStatusToast("Add some content first", "Write a caption or announcement before submitting.", "error");
      return;
    }
    if (!session?.org) {
      showStatusToast("Missing organization", "This session does not have an organization context.", "error");
      return;
    }
    const approval = createPostApproval({
      orgName: session.org,
      orgSlug: "cs-society",
      createdBy: session.name,
      type,
      visibility,
      pinned: pin,
      title,
      content,
      imageLabel: imageLabel || undefined,
      submit: !asDraft,
    });
    showStatusToast(
      asDraft ? "Post draft saved" : "Post submitted for approval",
      asDraft
        ? "You can reopen the draft from the post approvals page."
        : "The post now routes through adviser and Admin 2 review before publishing.",
    );
    navigate({ to: "/leader/post-approvals/$approvalId", params: { approvalId: approval.id } });
  }

  return (
    <>
      <PageHead title="Create post" sub="Route organization updates through a guided approval flow before they go live." />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Panel>
          <div className="mb-4 flex flex-wrap gap-2">
            {typeOpts.map((option) => (
              <button
                key={option.id}
                onClick={() => setType(option.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${type === option.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
              >
                <option.icon className="h-3.5 w-3.5" /> {option.label}
              </button>
            ))}
          </div>

          {type !== "general" && (
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your post a clear title" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="What's happening in your org?"
            className="w-full rounded-md border border-border bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none"
          />

          <label className="mt-3 grid h-44 cursor-pointer place-items-center rounded-md border-2 border-dashed border-border bg-secondary/40 text-center">
            <div>
              <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">{imageLabel || "Add a photo"}</p>
              <p className="text-xs text-muted-foreground">JPG or PNG - up to 8MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setImageLabel(e.target.files?.[0]?.name ?? "")}
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button onClick={() => setVisibility("public")} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${visibility === "public" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}><Globe className="h-3.5 w-3.5" /> Public</button>
              <button onClick={() => setVisibility("members")} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${visibility === "members" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}><Lock className="h-3.5 w-3.5" /> Members only</button>
              <button onClick={() => setPin((current) => !current)} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${pin ? "border-gold bg-gold/15 text-primary-deep" : "border-border bg-card text-muted-foreground"}`}><Pin className="h-3.5 w-3.5" /> {pin ? "Will pin" : "Pin"}</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => submit(true)} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Save draft</button>
              <button onClick={() => submit(false)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Submit for review</button>
            </div>
          </div>
        </Panel>

        <aside className="space-y-4">
          <Panel title="Preview">
            <div className="rounded-md border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-deep text-xs font-bold text-primary-foreground">CS</div>
                <div>
                  <p className="text-xs font-semibold">{session?.org ?? "Organization"}</p>
                  <p className="text-[10px] text-muted-foreground">pending approval - {visibility}</p>
                </div>
              </div>
              {title && <p className="text-sm font-semibold">{title}</p>}
              <p className="mt-1 line-clamp-4 text-sm text-foreground/90">{content || "Your post preview will appear here."}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge tone={type === "event" ? "gold" : type === "announcement" ? "info" : "neutral"}>{type}</Badge>
                {pin && <Badge tone="gold">Pinned</Badge>}
                <Badge tone="warning">Approval required</Badge>
              </div>
            </div>
          </Panel>
          <Panel title="Posting flow">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>* Leader writes the post in a structured draft.</li>
              <li>* Adviser reviews the message, audience, and visibility.</li>
              <li>* Admin 2 clears it for publishing.</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </>
  );
}
