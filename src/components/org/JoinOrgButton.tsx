import { useState } from "react";
import { Check, Clock, UserPlus } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showImportantActionToast, showStatusToast } from "@/lib/feedback";
import {
  cancelMembershipRequest,
  leaveOrganization,
  membershipStatus,
  requestMembership,
  useMemberships,
} from "@/lib/memberships";
import { cn } from "@/lib/utils";

/**
 * One membership control used everywhere a student can join an org:
 * Join -> Requested (click to withdraw) -> Joined (click to leave, with confirmation).
 */
export function JoinOrgButton({
  slug,
  orgName,
  size = "md",
  shape = "pill",
  className,
}: {
  slug: string;
  orgName: string;
  size?: "sm" | "md" | "lg";
  shape?: "pill" | "soft";
  className?: string;
}) {
  const status = membershipStatus(useMemberships(), slug);
  const [confirmLeave, setConfirmLeave] = useState(false);

  function onClick() {
    if (status === "none") {
      requestMembership(slug);
      showImportantActionToast("join", `${orgName} will review your membership request soon.`);
    } else if (status === "pending") {
      cancelMembershipRequest(slug);
      showStatusToast(
        "Request withdrawn",
        `Your request to join ${orgName} was withdrawn.`,
        "info",
      );
    } else {
      setConfirmLeave(true);
    }
  }

  const label = status === "member" ? "Joined" : status === "pending" ? "Requested" : "Join";
  const Icon = status === "member" ? Check : status === "pending" ? Clock : UserPlus;

  return (
    <>
      <AppButton
        type="button"
        size={size}
        shape={shape}
        variant={status === "none" ? "primary" : "secondary"}
        onClick={onClick}
        aria-label={
          status === "member"
            ? `Leave ${orgName}`
            : status === "pending"
              ? `Withdraw request to join ${orgName}`
              : `Join ${orgName}`
        }
        title={
          status === "member"
            ? "Leave organization"
            : status === "pending"
              ? "Withdraw request"
              : undefined
        }
        className={cn(className)}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </AppButton>
      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title={`Leave ${orgName}?`}
        description="You'll lose access to members-only posts. You can request to join again anytime."
        confirmLabel="Leave organization"
        tone="danger"
        onConfirm={() => {
          leaveOrganization(slug);
          showStatusToast("Left organization", `You are no longer a member of ${orgName}.`, "info");
        }}
      />
    </>
  );
}
