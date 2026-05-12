import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppAvatar } from "@/components/ui/app-avatar";

export function Composer({
  initials,
  prompt,
  ctaTo,
  actions,
}: {
  initials: string;
  prompt: string;
  ctaTo: string;
  actions: Array<{ label: string; icon: LucideIcon }>;
}) {
  return (
    <AppCard className="overflow-hidden rounded-[28px]" padded={false}>
      <div className="border-b border-border/80 px-5 pb-4 pt-5 sm:px-6">
        <div className="flex items-center gap-3">
          <AppAvatar className="h-12 w-12 bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(122,0,25,0.18)]">
            {initials}
          </AppAvatar>
          <Link to={ctaTo} className="flex-1 rounded-full bg-background px-5 py-3 text-sm text-muted-foreground transition hover:bg-secondary">
            {prompt}
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
        {actions.map((item, index) => (
          <AppButton key={item.label} variant={index === 0 ? "primary" : "subtle"} size="md">
            <item.icon className="h-4 w-4" />
            {item.label}
          </AppButton>
        ))}
      </div>
    </AppCard>
  );
}
