import { Badge } from "@/components/dashboard/DashboardLayout";
import { formatWorkflowStatus, statusTone, type WorkflowStatus } from "@/lib/workflows";

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return <Badge tone={statusTone(status)}>{formatWorkflowStatus(status)}</Badge>;
}
