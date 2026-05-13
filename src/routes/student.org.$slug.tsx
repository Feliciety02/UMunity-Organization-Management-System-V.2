import { createFileRoute, useParams } from "@tanstack/react-router";
import { OrgPageContent } from "@/components/org/OrgPageContent";
import { organizations } from "@/data/site";

export const Route = createFileRoute("/student/org/$slug")({
  component: StudentOrgView,
});

function StudentOrgView() {
  const { slug } = useParams({ from: "/student/org/$slug" });
  const org = organizations.find((item) => item.slug === slug);

  if (!org) {
    return (
      <div className="rounded-[24px] border border-border bg-card p-8 text-center shadow-soft">
        <h1 className="font-display text-2xl font-bold text-foreground">Organization not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The organization you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
      </div>
    );
  }

  return <OrgPageContent org={org} backHref="/student/my-orgs" backLabel="Back to My Organizations" relatedOrgRoute="/student/org/$slug" />;
}
