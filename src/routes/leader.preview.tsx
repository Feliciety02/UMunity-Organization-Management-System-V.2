import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHead, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { organizations } from "@/data/site";

export const Route = createFileRoute("/leader/preview")({
  component: Preview,
});

function Preview() {
  const org = organizations[0];
  const slug = org.slug;

  return (
    <>
      <PageHead
        title="Public preview"
        sub="See how students view your organization on UMunity."
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton asChild variant="secondary">
              <Link to="/org/$slug" params={{ slug }} target="_blank">
                Open live
              </Link>
            </AppButton>
            <AppButton asChild variant="primary">
              <Link to="/org/$slug" params={{ slug }} target="_blank">
                Open in new tab <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </AppButton>
          </div>
        }
      />

      <div className="mx-auto max-w-[1280px] space-y-6">
        <AppCard className="rounded-[28px] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br ${org.color} font-display text-lg font-bold text-primary-foreground`}>
                {org.initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-semibold text-foreground">{org.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{org.desc}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge>{org.category}</Badge>
                  <span>{org.members} members</span>
                  <span>Public organization preview</span>
                </div>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Review the public page in context before sharing new updates with students.
            </p>
          </div>
        </AppCard>

        <AppCard className="overflow-hidden rounded-[28px] p-0">
          <div className="border-b border-border bg-card px-5 py-4">
            <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
              {`/org/${slug}`}
            </div>
          </div>

          <div className="bg-background p-4 sm:p-5">
            <div className="overflow-hidden rounded-[22px] border border-border/70 bg-card">
              <iframe src={`/org/${slug}`} title="Org preview" className="h-[calc(100vh-260px)] min-h-[780px] w-full" />
            </div>
          </div>
        </AppCard>
      </div>
    </>
  );
}
