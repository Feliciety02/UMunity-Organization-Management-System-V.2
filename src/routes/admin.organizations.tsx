import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, EmptyState } from "@/components/dashboard/DashboardLayout";
import { organizations, type Org } from "@/data/site";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";
import { ShieldCheck } from "lucide-react";
import { PendingOrgRow } from "@/components/dashboard/PendingOrgRow";
import { usePendingOrgs } from "@/lib/admin-queues";

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrgs,
});

const columns: Column<Org>[] = [
  {
    key: "name",
    label: "Organization",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${row.color} text-xs font-bold text-primary-foreground`}
        >
          {row.initials}
        </div>
        <span className="font-semibold">{row.name}</span>
      </div>
    ),
  },
  { key: "category", label: "Category", sortable: true, render: (row) => <>{row.category}</> },
  { key: "members", label: "Members", sortable: true, render: (row) => <>{row.members}</> },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: () => <DataTableStatusBadge status="Recognized" />,
  },
];

function AdminOrgs() {
  const pending = usePendingOrgs();
  return (
    <>
      <PageHead
        title="Manage organizations"
        sub={`${organizations.length} active · ${pending.length} pending verification`}
      />

      <Panel title="Pending verification" className="mb-6">
        {pending.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No pending applications"
            sub="New organization applications will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <PendingOrgRow key={o.id} org={o} />
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Active organizations">
        <DataTable
          columns={columns}
          data={organizations}
          keyExtractor={(row) => row.slug}
          searchable
          searchPlaceholder="Search organizations..."
          pageSize={10}
        />
      </Panel>
    </>
  );
}
