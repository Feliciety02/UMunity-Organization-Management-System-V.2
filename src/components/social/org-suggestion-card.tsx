import type { Org } from "@/data/site";
import { OrgLink, type OrgLinkMode } from "@/components/org/OrgLink";
import { OrgAvatar } from "@/components/social/PostCard";
import { JoinOrgButton } from "@/components/org/JoinOrgButton";
import { AppCard } from "@/components/ui/app-card";

export function OrgSuggestionCard({
  org,
  coverTone,
  reason,
  orgLinkMode = "public",
}: {
  org: Org;
  coverTone: string;
  reason: string;
  orgLinkMode?: OrgLinkMode;
}) {
  return (
    <AppCard
      className="overflow-hidden rounded-[24px] transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
      padded={false}
    >
      <div className={`h-16 bg-gradient-to-r ${coverTone}`} />
      <div className="flex gap-3 p-4">
        <div className="-mt-8 rounded-[18px] border-4 border-card bg-card shadow-soft">
          <OrgAvatar org={org} size={52} />
        </div>
        <div className="min-w-0 flex-1">
          <OrgLink
            slug={org.slug}
            mode={orgLinkMode}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {org.name}
          </OrgLink>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {org.category} · {org.members} members
          </p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{reason}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
        <span className="text-xs text-muted-foreground">Recommended for you</span>
        <JoinOrgButton slug={org.slug} orgName={org.name} size="sm" />
      </div>
    </AppCard>
  );
}
