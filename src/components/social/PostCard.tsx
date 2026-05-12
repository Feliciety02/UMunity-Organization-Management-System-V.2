import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Pin, MoreHorizontal, Globe, Lock, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Post, Comment, Org } from "@/data/site";
import { Badge } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export function OrgAvatar({ org, size = 40 }: { org: Pick<Org, "color" | "initials">; size?: number }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-md bg-gradient-to-br ${org.color} font-display font-bold text-primary-foreground`}
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
    setLiked((l) => !l);
    setLikes((n) => (liked ? n - 1 : n + 1));
  }

  function submitComment() {
    if (!draft.trim()) return;
    setComments((cs) => [
      ...cs,
      { id: `local-${Date.now()}`, author: "Althea Dumaguete", program: "BS CS · 3rd Yr", text: draft, time: "now" },
    ]);
    setDraft("");
    toast.success("Comment posted");
  }

  const typeLabel = post.type === "event" ? "Event" : post.type === "announcement" ? "Announcement" : null;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <header className="flex items-start gap-3 p-4">
        <Link to="/org/$slug" params={{ slug: org.slug }}>
          <OrgAvatar org={org} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/org/$slug" params={{ slug: org.slug }} className="font-display text-sm font-semibold hover:underline">
              {org.name}
            </Link>
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary-deep">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            {typeLabel && <Badge tone={post.type === "event" ? "gold" : "info"}>{typeLabel}</Badge>}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{post.time}</span> · {post.visibility === "public" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span>{post.visibility === "public" ? "Public" : "Members only"}</span>
          </p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div className="px-4 pb-3">
        {post.title && <h3 className="mb-1.5 font-display text-base font-semibold">{post.title}</h3>}
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{post.content}</p>
      </div>

      {post.image && (
        <div className={`relative h-64 w-full bg-gradient-to-br ${post.image}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_50%)]" />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-2 py-1">
        <button
          onClick={toggleLike}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-secondary ${liked ? "text-primary" : "text-muted-foreground"}`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} /> {likes}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
        >
          <MessageCircle className="h-4 w-4" /> {comments.length}
        </button>
        <button
          onClick={() => { setSaved((s) => !s); toast.success(saved ? "Removed from saved" : "Saved"); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-secondary ${saved ? "text-primary" : "text-muted-foreground"}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} /> Save
        </button>
      </div>

      {showComments && (
        <div className="border-t border-border bg-secondary/30 p-4">
          <div className="space-y-3">
            {comments.length === 0 && <p className="text-center text-xs text-muted-foreground">Be the first to comment.</p>}
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">AD</div>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Write a comment..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button onClick={submitComment} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-deep">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {manage && (
        <div className="flex gap-2 border-t border-border bg-secondary/30 px-4 py-2 text-xs">
          <button className="rounded-md border border-border bg-card px-2.5 py-1 font-medium hover:bg-secondary">Edit</button>
          <button className="rounded-md border border-border bg-card px-2.5 py-1 font-medium hover:bg-secondary">{post.pinned ? "Unpin" : "Pin"}</button>
          <button className="rounded-md border border-border bg-card px-2.5 py-1 font-medium text-destructive hover:bg-destructive/5">Delete</button>
        </div>
      )}
    </article>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-start gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-primary-deep">
        {comment.author.split(" ").slice(0, 2).map((w) => w[0]).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-card px-3 py-2 shadow-soft">
          <p className="text-xs font-semibold">{comment.author}{comment.program && <span className="ml-1 font-normal text-muted-foreground">· {comment.program}</span>}</p>
          <p className="text-sm">{comment.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-3 text-[11px] text-muted-foreground">
          <button className="font-semibold hover:text-foreground">Like</button>
          <button className="font-semibold hover:text-foreground">Reply</button>
          <span>{comment.time}</span>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-border pl-3">
            {comment.replies.map((r) => <CommentItem key={r.id} comment={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
