import { createFileRoute } from "@tanstack/react-router";
import { FinanceLedger } from "@/components/finance/FinanceLedger";

export const Route = createFileRoute("/leader/finance")({
  // ?event=<workflow id> opens the record form with that event already chosen (from an event's closeout).
  validateSearch: (search: Record<string, unknown>): { event?: string } => (typeof search.event === "string" ? { event: search.event } : {}),
  component: LeaderFinance,
});

function LeaderFinance() {
  const { event } = Route.useSearch();
  return <FinanceLedger sub="Every peso in and out of your organization, with receipts your members can see." recordForEvent={event} />;
}
