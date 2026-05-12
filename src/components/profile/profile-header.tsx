import { Camera, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { UnderlineTabs } from "@/components/ui/app-tabs";
import { IconButton } from "@/components/ui/icon-button";

export function ProfileHeader<T extends string>({
  initials,
  name,
  subtitle,
  tabs,
  tab,
  onTabChange,
  badges,
  onEditCover,
  onEditProfile,
  onEditAvatar,
}: {
  initials: string;
  name: string;
  subtitle: string;
  tabs: readonly T[];
  tab: T;
  onTabChange: (tab: T) => void;
  badges: Array<{ label: string; tone?: Parameters<typeof AppBadge>[0]["tone"] }>;
  onEditCover: () => void;
  onEditProfile: () => void;
  onEditAvatar: () => void;
}) {
  return (
    <AppCard className="overflow-hidden rounded-[32px]" padded={false}>
      <div className="relative h-[220px] bg-gradient-to-br from-primary-deep via-primary to-amber-700 md:h-[240px] xl:h-[256px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.14))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(244,176,0,0.35),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.12))]" />
        <AppButton variant="ghost" className="absolute right-4 top-4 border border-white/30 bg-black/30 px-4 text-white backdrop-blur hover:bg-black/45 hover:text-white" onClick={onEditCover}>
          <Camera className="h-4 w-4" /> Edit cover
        </AppButton>
      </div>
      <div className="relative bg-card px-5 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 pt-20 md:flex-row md:items-end md:justify-between md:pt-8">
          <div className="flex flex-col items-center gap-4 md:min-w-0 md:flex-1 md:flex-row md:items-end md:gap-5">
            <div className="relative md:-mt-20">
              <div className="grid h-[116px] w-[116px] place-items-center rounded-full border-[6px] border-white bg-gradient-to-br from-primary to-primary-deep font-display text-[2rem] font-bold text-primary-foreground shadow-[0_14px_40px_rgba(17,17,17,0.16)] md:h-[124px] md:w-[124px] md:text-[2.2rem]">
                {initials}
              </div>
              <IconButton onClick={onEditAvatar} className="absolute bottom-1 right-1 h-9 w-9 rounded-full">
                <Camera className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="min-w-0 text-center md:pb-1 md:text-left">
              <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-foreground md:text-[1.95rem]">{name}</h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-[15px]">{subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {badges.map((badge) => (
                  <AppBadge key={badge.label} tone={badge.tone}>{badge.label}</AppBadge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <AppButton variant="secondary" onClick={onEditProfile}>
              <Pencil className="h-4 w-4" /> Edit profile
            </AppButton>
          </div>
        </div>
        <div className="mt-6 border-b border-border/90">
          <UnderlineTabs items={tabs} value={tab} onChange={onTabChange} />
        </div>
      </div>
    </AppCard>
  );
}
