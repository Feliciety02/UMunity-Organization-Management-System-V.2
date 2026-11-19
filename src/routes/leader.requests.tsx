import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Inbox, X } from "lucide-react";
import {
  PageHead,
  Panel,
  Avatar,
  Badge,
  EmptyState,
  PanelSkeleton,
} from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { showStatusToast, useDashboardPageLoading } from "@/lib/feedback";
import { resolveMembershipRequest, useMembershipRequests } from "@/lib/membership-requests";

export const Route = createFileRoute("/leader/requests")({
  component: Requests,
});

function Requests() {
  const loading = useDashboardPageLoading();
  const requests = useMembershipRequests();

  if (loading) {
    return (
      <>
        <PageHead title="Membership requests" sub="Loading new applicants for your organization." />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <PanelSkeleton key={index} rows={4} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Membership requests"
        sub={
          requests.length === 0
            ? "No students are waiting right now."
            : `${requests.length} ${requests.length === 1 ? "student is" : "students are"} waiting to join your organization.`
        }
      />

      {requests.length === 0 ? (
        <Panel>
          <EmptyState
            title="No membership requests right now"
            sub="Share your organization profile or publish an update to attract more applicants."
            icon={Inbox}
            action={
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/leader/create-post">Publish an update</Link>
              </AppButton>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r, i) => (
            <Panel key={r.id}>
              <div className="flex items-start gap-3">
                <Avatar
                  name={r.name}
                  color={
                    [
                      "from-rose-400 to-primary",
                      "from-primary to-primary",
                      "from-emerald-400 to-primary-deep",
                      "from-primary-deep to-rose-700",
                    ][i % 4]
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.program} · {r.time}
                  </p>
                  <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm italic text-foreground/80">
                    "{r.reason}"
                  </p>
                  <div className="mt-4 flex gap-2">
                    <AppButton
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        resolveMembershipRequest(r.id, true);
                        showStatusToast(
                          "Request approved",
                          `${r.name} can now access your organization space.`,
                        );
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        resolveMembershipRequest(r.id, false);
                        showStatusToast(
                          "Request denied",
                          `${r.name}'s membership request has been declined.`,
                          "warning",
                        );
                      }}
                    >
                      <X className="h-3.5 w-3.5" /> Deny
                    </AppButton>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
