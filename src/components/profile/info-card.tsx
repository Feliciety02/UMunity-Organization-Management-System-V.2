import type { ReactNode } from "react";
import { AppCard, AppCardHeader } from "@/components/ui/app-card";

export function InfoCard({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AppCard className={className}>
      <AppCardHeader title={title} action={action} />
      {children}
    </AppCard>
  );
}
