import type { Org } from "@/data/orgs";
import type { OrgRegistryRecord } from "@/lib/org-registry";

export type DiscoverableOrg = Org & {
  registry: OrgRegistryRecord | null;
};

export function isOrgDiscoverable(record: OrgRegistryRecord | null) {
  if (!record) return true;
  return record.lifecycleStatus === "recognized" && record.accreditationStatus === "active";
}

export function getDiscoverableOrganizations(
  organizations: Org[],
  registry: OrgRegistryRecord[],
): DiscoverableOrg[] {
  const registryBySlug = new Map(registry.map((record) => [record.slug, record]));
  return organizations
    .map((org) => ({
      ...org,
      registry: registryBySlug.get(org.slug) ?? null,
    }))
    .filter((org) => isOrgDiscoverable(org.registry));
}
