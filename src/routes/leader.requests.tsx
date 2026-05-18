import { createFileRoute } from "@tanstack/react-router";
import { Check, Inbox, X } from "lucide-react";
import { PageHead, Panel, Avatar, Badge, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { showStatusToast, useDashboardPageLoading } from "@/lib/feedback";

export const Route = createFileRoute("/leader/requests")({
  component: Requests,
});

const requests = [
  { n: "Jana Cruz", c: "BS IT - 2nd Year", reason: "I want to grow my coding skills and meet like-minded peers.", time: "Today, 10:14 AM" },
  { n: "Marvin Lim", c: "BS CS - 1st Year", reason: "Big fan of the org's hackathons. Excited to contribute!", time: "Today, 9:02 AM" },
  { n: "Ria Santos", c: "BS IS - 3rd Year", reason: "Looking to lead UI/UX initiatives this semester.", time: "Yesterday" },
  { n: "Tomas Vega", c: "BS CS - 4th Year", reason: "Returning member after a year on exchange.", time: "Yesterday" },
];

function Requests() {
  const loading = useDashboardPageLoading();

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
      <PageHead title="Membership requests" sub="12 students are waiting to join your organization." />

      {requests.length === 0 ? (
        <Panel>
          <EmptyState
            title="No membership requests right now"
            sub="Share your organization profile or publish an update to attract more applicants."
            icon={Inbox}
            action={<AppButton variant="secondary" size="sm">Refresh later</AppButton>}
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r, i) => (
            <Panel key={r.n}>
              <div className="flex items-start gap-3">
                <Avatar name={r.n} color={["from-rose-400 to-primary", "from-amber-500 to-primary", "from-emerald-400 to-primary-deep", "from-primary-deep to-rose-700"][i % 4]} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.n}</p>
                    <Badge tone="warning">Pending</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.c} - {r.time}</p>
                  <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm italic text-foreground/80">"{r.reason}"</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => showStatusToast("Request approved", `${r.n} can now access your organization space.`)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary-deep"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => showStatusToast("Request denied", `${r.n}'s membership request has been declined.`, "warning")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card py-2 text-xs font-bold transition hover:bg-secondary"
                    >
                      <X className="h-3.5 w-3.5" /> Deny
                    </button>
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
