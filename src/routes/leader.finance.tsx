import { createFileRoute } from "@tanstack/react-router";
import { FinanceLedger } from "@/components/finance/FinanceLedger";

export const Route = createFileRoute("/leader/finance")({
  component: () => <FinanceLedger sub="Every peso in and out of your organization, with receipts your members can see." />,
});
