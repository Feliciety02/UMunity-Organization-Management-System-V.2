import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/admin2/compliance")({
  component: Admin2Compliance,
});

function Admin2Compliance() {
  const checks = [
    ["Venue endorsement", "Verified"],
    ["Budget structure", "Pending cross-check"],
    ["Safety and attendance plan", "Verified"],
    ["Submission completeness", "Verified"],
  ];

  return (
    <>
      <PageHead title="Compliance overview" sub="Structured checks replace scattered paper verifications." />
      <Panel>
        <div className="space-y-3">
          {checks.map(([label, status]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">Standardized checkpoint in the approval workflow</p>
              </div>
              <Badge tone={status === "Verified" ? "success" : "warning"}>{status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
