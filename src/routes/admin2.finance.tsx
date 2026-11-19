import { createFileRoute } from "@tanstack/react-router";
import { FinanceLedger } from "@/components/finance/FinanceLedger";

export const Route = createFileRoute("/admin2/finance")({
  component: () => (
    <FinanceLedger sub="Every organization's books in one place: verify transactions and spot missing receipts." />
  ),
});
