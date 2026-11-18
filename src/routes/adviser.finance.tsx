import { createFileRoute } from "@tanstack/react-router";
import { FinanceLedger } from "@/components/finance/FinanceLedger";

export const Route = createFileRoute("/adviser/finance")({
  component: () => <FinanceLedger sub="Check receipts and verify the transactions of the organization you advise." />,
});
