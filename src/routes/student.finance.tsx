import { createFileRoute } from "@tanstack/react-router";
import { FinanceLedger } from "@/components/finance/FinanceLedger";

export const Route = createFileRoute("/student/finance")({
  component: () => <FinanceLedger sub="The books of the organizations you belong to: every peso in and out, with receipts." />,
});
