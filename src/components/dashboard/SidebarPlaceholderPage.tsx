import { Link } from "@tanstack/react-router";
import { PageHead, Panel, EmptyState } from "@/components/dashboard/DashboardLayout";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function SidebarPlaceholderPage({
  title,
  sub,
  icon: Icon,
  actionLabel,
  actionTo,
}: {
  title: string;
  sub: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <>
      <PageHead
        title={title}
        sub={sub}
        action={
          actionLabel && actionTo ? (
            <Link to={actionTo} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep">
              {actionLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      <Panel>
        <EmptyState title={title} sub={sub} icon={Icon} />
      </Panel>
    </>
  );
}
