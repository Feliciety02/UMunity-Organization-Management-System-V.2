import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { OrgPageContent } from "@/components/org/OrgPageContent";
import { organizations } from "@/data/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/org/$slug")({
  component: OrgPage,
  head: ({ params }) => {
    const org = organizations.find((o) => o.slug === params.slug);
    const title = org ? `${org.name} — UMunity` : "Organization — UMunity";
    const description = org?.desc ?? "Discover student organizations at the University of Mindanao.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
});

function OrgPage() {
  const { slug } = useParams({ from: "/org/$slug" });
  const org = organizations.find((o) => o.slug === slug);

  if (!org) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Organization not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The org you&apos;re looking for doesn&apos;t exist or was archived.</p>
          <Link to="/organizations" className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Browse all orgs
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <OrgPageContent org={org} relatedOrgRoute="/org/$slug" />
      </main>
      <SiteFooter />
    </div>
  );
}
