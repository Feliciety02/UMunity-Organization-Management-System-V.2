import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";

export function EngagementBar({
  liked,
  saved,
  onLike,
  onComment,
  onShare,
  onSave,
}: {
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mx-5 flex items-center justify-between border-t border-border/80 py-2">
      <AppButton variant="ghost" shape="soft" className={liked ? "flex-1 text-primary" : "flex-1"} onClick={onLike}>
        <Heart className={liked ? "fill-primary" : ""} />
        Like
      </AppButton>
      <AppButton variant="ghost" shape="soft" className="flex-1" onClick={onComment}>
        <MessageCircle />
        Comment
      </AppButton>
      <AppButton variant="ghost" shape="soft" className="flex-1" onClick={onShare}>
        <Share2 />
        Share
      </AppButton>
      <AppButton variant="ghost" shape="soft" className={saved ? "flex-1 text-primary" : "flex-1"} onClick={onSave}>
        <Bookmark className={saved ? "fill-primary" : ""} />
        Save
      </AppButton>
    </div>
  );
}
