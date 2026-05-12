import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/dashboard/DashboardLayout";
import { ExternalLink } from "lucide-react";
import { organizations } from "@/data/site";

export const Route = createFileRoute("/leader/preview")({
  component: Preview,
});

function Preview() {
  const slug = organizations[0].slug;
  return (
    <>
      <PageHead
        title="Public preview"
        sub="See how students view your organization on UMUnity."
        action={
          <Link to="/org/$slug" params={{ slug }} target="_blank" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
            Open in new tab <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <iframe src={`/org/${slug}`} title="Org preview" className="h-[calc(100vh-220px)] w-full" />
      </div>
    </>
  );
}
