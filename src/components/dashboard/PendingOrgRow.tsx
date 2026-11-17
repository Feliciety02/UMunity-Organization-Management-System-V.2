import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { orgInitials, resolvePendingOrg, type PendingOrg } from "@/lib/admin-queues";
import { showStatusToast } from "@/lib/feedback";

/** One pending organization with Approve / Reject, shared by the admin dashboard and Organizations page. */
export function PendingOrgRow({ org, compact = false }: { org: PendingOrg; compact?: boolean }) {
  const [confirmReject, setConfirmReject] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-3">
      <div className={`grid place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground ${compact ? "h-10 w-10" : "h-12 w-12"}`}>
        {orgInitials(org.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{org.name}</p>
        <p className="text-xs text-muted-foreground">
          {org.category} · Submitted by {org.submittedBy} on {org.submitted}
        </p>
      </div>
      <div className="flex gap-2">
        <AppButton
          variant="primary"
          size="sm"
          onClick={() => {
            resolvePendingOrg(org.id);
            showStatusToast("Organization approved", `${org.name} is now a recognized organization.`);
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          className="border border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmReject(true)}
        >
          <X className="h-3.5 w-3.5" /> Reject
        </AppButton>
      </div>
      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title={`Reject ${org.name}?`}
        description="The applicants will be notified and can resubmit later."
        confirmLabel="Reject application"
        tone="danger"
        onConfirm={() => {
          resolvePendingOrg(org.id);
          showStatusToast("Application rejected", `${org.submittedBy} has been notified.`, "warning");
        }}
      />
    </div>
  );
}
