import { useState } from "react";
import { Calendar, Globe, Lock, MoreHorizontal, Pin, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Comment, Org, Post } from "@/data/site";
import { Badge } from "@/components/dashboard/DashboardLayout";
import { EngagementBar } from "@/components/social/engagement-bar";
import { RsvpButton } from "@/components/events/rsvp-button";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { IconButton } from "@/components/ui/icon-button";

export function OrgAvatar({ org, size = 40 }: { org: Pick<Org, "color" | "initials">; size?: number }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-[16px] bg-gradient-to-br ${org.color} font-display font-bold text-primary-foreground`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {org.initials}
    </div>
  );
}

export function PostCard({ post, org, manage }: { post: Post; org: Org; manage?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments);

  function toggleLike() {
    setLiked((current) => !current);
    setLikes((count) => (liked ? count - 1 : count + 1));
  }

  function submitComment() {
    if (!draft.trim()) return;
    setComments((current) => [
      ...current,
      { id: `local-${Date.now()}`, author: "Althea Dumaguete", program: "BS CS · 3rd Yr", text: draft, time: "now" },
    ]);
    setDraft("");
    toast.success("Comment posted");
  }

  const typeLabel = post.type === "event" ? "Event" : post.type === "announcement" ? "Announcement" : null;
  const visual = post.image ? postVisuals[post.id] ?? defaultVisual : null;

  return (
    <AppCard className="overflow-hidden rounded-[24px] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(17,17,17,0.08)]" padded={false}>
      <header className="flex items-start gap-3 px-5 pb-4 pt-5">
        <Link to="/org/$slug" params={{ slug: org.slug }}>
          <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(122,0,25,0.09),rgba(122,0,25,0.03))] p-0.5">
            <OrgAvatar org={org} size={48} />
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/org/$slug" params={{ slug: org.slug }} className="font-display text-[15px] font-semibold hover:underline">
              {org.name}
            </Link>
            {post.pinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-primary-deep">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            ) : null}
            {typeLabel ? <Badge tone={post.type === "event" ? "gold" : "info"}>{typeLabel}</Badge> : null}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{post.time}</span> · {post.visibility === "public" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span>{post.visibility === "public" ? "Public" : "Members only"}</span>
          </p>
        </div>
        <IconButton tone="ghost" className="h-9 w-9">
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </header>

      <div className="px-5 pb-4">
        {post.title ? <h3 className="mb-2 font-display text-[1.05rem] font-semibold leading-7 text-foreground">{post.title}</h3> : null}
        <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">{post.content}</p>
      </div>

      {visual ? (
        <div className="px-5 pb-4">
          <div
            className="relative aspect-[16/9] overflow-hidden rounded-[22px] border border-border/60 bg-cover bg-center"
            style={{ backgroundImage: `url("${visual}")` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.02),rgba(17,17,17,0.12))]" />
          </div>
        </div>
      ) : null}

      <div className="px-5 pb-3">
        <div className="flex items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
          <span>{likes} reactions</span>
          <div className="flex items-center gap-3">
            <span>{comments.length} comments</span>
            <span>12 shares</span>
          </div>
        </div>
      </div>

      <EngagementBar
        liked={liked}
        saved={saved}
        onLike={toggleLike}
        onComment={() => setShowComments((current) => !current)}
        onShare={() => toast.success("Post shared")}
        onSave={() => {
          setSaved((current) => !current);
          toast.success(saved ? "Removed from saved" : "Saved");
        }}
      />

      {showComments ? (
        <div className="border-t border-border bg-secondary/25 p-5">
          <div className="space-y-3">
            {comments.length === 0 ? <p className="text-center text-xs text-muted-foreground">Be the first to comment.</p> : null}
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-soft">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">AD</div>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitComment()}
              placeholder="Write a comment..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <AppButton onClick={submitComment} variant="primary" size="icon" className="h-7 w-7">
              <Send className="h-3.5 w-3.5" />
            </AppButton>
          </div>
        </div>
      ) : null}

      {manage ? (
        <div className="flex gap-2 border-t border-border bg-secondary/30 px-5 py-3 text-xs">
          <AppButton variant="secondary" size="sm" shape="soft">Edit</AppButton>
          <AppButton variant="secondary" size="sm" shape="soft">{post.pinned ? "Unpin" : "Pin"}</AppButton>
          <AppButton variant="ghost" size="sm" shape="soft" className="text-destructive hover:bg-destructive/5 hover:text-destructive">
            Delete
          </AppButton>
        </div>
      ) : null}
    </AppCard>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-start gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-primary-deep">
        {comment.author.split(" ").slice(0, 2).map((word) => word[0]).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-card px-3 py-2 shadow-soft">
          <p className="text-xs font-semibold">
            {comment.author}
            {comment.program ? <span className="ml-1 font-normal text-muted-foreground">· {comment.program}</span> : null}
          </p>
          <p className="text-sm">{comment.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-3 text-[11px] text-muted-foreground">
          <button className="font-semibold hover:text-foreground">Like</button>
          <button className="font-semibold hover:text-foreground">Reply</button>
          <span>{comment.time}</span>
        </div>
        {comment.replies?.length ? (
          <div className="mt-2 space-y-2 border-l-2 border-border pl-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const postVisuals: Record<string, string> = {
  p1: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#480012"/>
          <stop offset="50%" stop-color="#7A0019"/>
          <stop offset="100%" stop-color="#d54458"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#a)"/>
      <ellipse cx="760" cy="40" rx="360" ry="180" fill="#ffd6a3" opacity="0.24"/>
      <g stroke="#f6d7de" stroke-width="3" opacity="0.18">
        <path d="M70 580 L350 110"/><path d="M210 620 L500 90"/><path d="M420 610 L660 120"/><path d="M730 620 L930 170"/>
      </g>
      <g fill="#130106">
        <path d="M0 500 C150 420 340 520 510 470 C710 412 860 520 1200 430 L1200 675 L0 675 Z"/>
      </g>
      <g fill="#fff" opacity="0.95">
        <text x="90" y="130" font-family="Arial, sans-serif" font-size="36" font-weight="700">UM Innovation Summit 2026</text>
        <text x="90" y="180" font-family="Arial, sans-serif" font-size="20">Talks • Workshops • Hackathon</text>
      </g>
    </svg>
  `),
  p2: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#173c1b"/>
          <stop offset="50%" stop-color="#3d8f47"/>
          <stop offset="100%" stop-color="#bddf6a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#a)"/>
      <circle cx="930" cy="140" r="150" fill="#fff5c4" opacity="0.35"/>
      <ellipse cx="180" cy="130" rx="190" ry="120" fill="#24552a"/>
      <ellipse cx="1040" cy="120" rx="170" ry="120" fill="#2c6b32"/>
      <circle cx="620" cy="330" r="110" fill="#57b96b"/>
      <path d="M560 300 C590 264 660 256 720 278 C690 324 690 362 718 404 C653 406 598 390 567 354 C550 337 547 316 560 300 Z" fill="#2f7ab8"/>
      <g fill="#fff" opacity="0.96">
        <text x="90" y="120" font-family="Arial, sans-serif" font-size="34" font-weight="700">Plastic-Free May</text>
        <text x="90" y="166" font-family="Arial, sans-serif" font-size="20">Campus impact report</text>
      </g>
    </svg>
  `),
  p4: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c170f"/>
          <stop offset="40%" stop-color="#cb5e1e"/>
          <stop offset="100%" stop-color="#354f89"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#a)"/>
      <circle cx="1050" cy="120" r="44" fill="#ffd18a" opacity="0.28"/>
      <circle cx="980" cy="220" r="18" fill="#ffd18a" opacity="0.18"/>
      <path d="M140 50 C90 150 110 250 180 360 C220 425 220 520 170 600" fill="none" stroke="#5a180f" stroke-width="40" stroke-linecap="round"/>
      <path d="M140 50 C210 160 270 260 300 420" fill="none" stroke="#f3c35c" stroke-width="70" stroke-linecap="round"/>
      <rect x="520" y="220" width="28" height="250" fill="#0a75d1"/>
      <polygon points="548,220 620,170 620,420 548,470" fill="#d5b24f"/>
      <polygon points="760,220 815,180 815,470 760,510" fill="#c4372f"/>
      <polygon points="815,180 875,205 875,505 815,470" fill="#0e8c53"/>
      <polygon points="875,205 935,160 935,535 875,505" fill="#f3ba17"/>
      <g fill="#fff" opacity="0.96">
        <text x="90" y="118" font-family="Arial, sans-serif" font-size="34" font-weight="700">Cultural Night Auditions</text>
        <text x="90" y="164" font-family="Arial, sans-serif" font-size="20">Music • Dance • Stagecraft</text>
      </g>
    </svg>
  `),
};

const defaultVisual = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4efe5"/>
        <stop offset="100%" stop-color="#efe6d7"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#a)"/>
    <circle cx="920" cy="140" r="150" fill="#7A0019" opacity="0.08"/>
    <circle cx="240" cy="520" r="180" fill="#f4b000" opacity="0.08"/>
  </svg>
`);
