import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CheckCircle2, Paperclip, Plus, Wallet } from "lucide-react";
import { Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { organizations } from "@/data/orgs";
import { formatPeso, STATUS_LABEL, STATUS_TONE, useLedger } from "@/lib/finance";
import { cn } from "@/lib/utils";

type ViewerRole = "leader" | "adviser" | "admin2" | "admin1";

/**
 * The event's real money trail: ledger entries linked to this event, with their receipts and
 * verification, set against the closeout's typed actual amounts so any gap is visible to reviewers.
 */
export function EventFinancePanel({
  workflowId,
  orgName,
  role,
  plannedTotal,
  reportedTotal,
}: {
  workflowId: string;
  orgName: string;
  role: ViewerRole;
  /** Proposal budget, in pesos. */
  plannedTotal: number;
  /** Sum of the closeout's typed actual amounts, in pesos. */
  reportedTotal: number;
}) {
  const slug = organizations.find((o) => o.name === orgName)?.slug ?? null;
  const { ledger, error } = useLedger(slug);
  const ledgerHref = `/${role}/finance` as const;

  const shell = (body: React.ReactNode) => (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Ledger and receipts</p>
          <p className="text-xs text-muted-foreground">Transactions recorded in the finance ledger for this event.</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </span>
      </div>
      {body}
    </div>
  );

  if (!slug) return shell(<p className="text-sm text-muted-foreground">This organization doesn't have a finance ledger yet.</p>);
  if (error) return shell(<p className="text-sm text-muted-foreground">{error}</p>);
  if (!ledger) return shell(<div className="h-16 animate-pulse rounded-xl bg-secondary" />);

  const linked = ledger.entries.filter((e) => e.workflowId === workflowId);
  const live = linked.filter((e) => e.status !== "void");
  const spent = live.filter((e) => e.kind === "expense").reduce((n, e) => n + e.amountCents, 0);
  const raised = live.filter((e) => e.kind === "income").reduce((n, e) => n + e.amountCents, 0);
  const missing = live.filter((e) => e.kind === "expense" && e.receipts.length === 0).length;
  const unverified = live.filter((e) => e.status !== "verified").length;
  const reportedCents = Math.round(reportedTotal * 100);
  const gap = reportedCents - spent;

  const warnings: string[] = [];
  if (missing) warnings.push(`${missing} expense${missing === 1 ? "" : "s"} without a receipt`);
  if (unverified) warnings.push(`${unverified} transaction${unverified === 1 ? "" : "s"} not verified yet`);
  if (reportedCents > 0 && gap !== 0) {
    warnings.push(`The closeout reports ${formatPeso(reportedCents)} spent, but the ledger shows ${formatPeso(spent)} (${gap > 0 ? "+" : "−"}${formatPeso(Math.abs(gap))})`);
  }

  return shell(
    <>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Budget", formatPeso(Math.round(plannedTotal * 100))],
          ["Spent", formatPeso(spent)],
          ["Raised", formatPeso(raised)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-secondary/50 px-2 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="font-display text-sm font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      {linked.length ? (
        <ul className="mt-3 space-y-2">
          {linked.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                  e.kind === "income"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                )}
              >
                {e.kind === "income" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", e.status === "void" && "text-muted-foreground line-through")}>{e.description}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {e.receipts.length ? (
                    <>
                      <Paperclip className="h-3 w-3" /> {e.receipts.length} receipt{e.receipts.length === 1 ? "" : "s"}
                    </>
                  ) : e.kind === "expense" && e.status !== "void" ? (
                    <span className="font-semibold text-destructive">No receipt</span>
                  ) : (
                    "No receipt needed"
                  )}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold tabular-nums">
                {e.kind === "income" ? "+" : "−"}
                {formatPeso(e.amountCents)}
              </span>
              <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          No transactions are linked to this event yet.
          {role === "leader" ? " Record each expense with its receipt so reviewers can check the closeout." : ""}
        </p>
      )}

      {warnings.length ? (
        <div className="mt-3 flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <ul className="space-y-1">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : linked.length ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Every transaction is verified and backed by receipts.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {role === "leader" && ledger.access.record ? (
          <AppButton asChild variant="primary" size="sm">
            <Link to="/leader/finance" search={{ event: workflowId }}>
              <Plus className="h-4 w-4" /> Record with receipt
            </Link>
          </AppButton>
        ) : null}
        <AppButton asChild variant="secondary" size="sm">
          <Link to={ledgerHref}>Open finance ledger</Link>
        </AppButton>
      </div>
    </>,
  );
}
