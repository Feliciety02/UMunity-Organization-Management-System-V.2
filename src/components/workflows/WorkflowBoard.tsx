import { Link } from "@tanstack/react-router";
import { CalendarDays, FileStack, MapPin } from "lucide-react";
import { PageHead, Panel, EmptyState, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { closeoutStatusTone, formatCloseoutStatus, formatWorkflowStatus, proposalCompletion, type EventWorkflow } from "@/lib/workflows";
import { WorkflowStatusBadge } from "@/components/workflows/WorkflowStatusBadge";

export function WorkflowBoard({
  title,
  sub,
  workflows,
  detailBase,
  emptyTitle,
  emptySub,
  emptyAction,
  action,
}: {
  title: string;
  sub: string;
  workflows: EventWorkflow[];
  detailBase: string;
  emptyTitle: string;
  emptySub: string;
  emptyAction?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <>
      <PageHead title={title} sub={sub} action={action} />
      {workflows.length === 0 ? (
        <Panel>
          <EmptyState title={emptyTitle} sub={emptySub} icon={FileStack} action={emptyAction} />
        </Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {workflows.map((workflow) => {
            const completion = proposalCompletion(workflow.proposal);
            return (
              <Panel key={workflow.id} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <WorkflowStatusBadge status={workflow.status} />
                  <Badge tone="info">{workflow.proposal.category}</Badge>
                  <Badge tone="gold">{workflow.orgShort}</Badge>
                  {(workflow.status === "approved" || workflow.status === "completed") ? (
                    <Badge tone={closeoutStatusTone(workflow.operations.postEvent.closeoutStatus)}>
                      {formatCloseoutStatus(workflow.operations.postEvent.closeoutStatus)}
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold">{workflow.proposal.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{workflow.orgName}</p>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {workflow.proposal.date || "TBA"}{workflow.proposal.time ? ` - ${workflow.proposal.time}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {workflow.proposal.venue || "Venue TBA"}
                  </p>
                </div>

                <div className="rounded-2xl bg-secondary/35 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Form completion</span>
                    <span className="font-semibold text-foreground">{completion.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${completion.pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {completion.done} of {completion.total} structured sections filled.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current stage</p>
                  <p className="mt-1 text-sm font-semibold">{workflow.currentStage}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {workflow.comments.length} comment{workflow.comments.length === 1 ? "" : "s"} and {workflow.history.length} history entries.
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <AppButton asChild variant="primary" size="sm">
                    <Link to={`${detailBase}/$workflowId` as string} params={{ workflowId: workflow.id }}>
                      Open workflow
                    </Link>
                  </AppButton>
                  <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {formatWorkflowStatus(workflow.status)}
                  </span>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
