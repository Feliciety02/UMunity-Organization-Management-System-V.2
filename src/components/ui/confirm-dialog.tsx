import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Tone = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {tone === "danger" ? (
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : null}
            <AlertDialogTitle className="font-display text-lg">{title}</AlertDialogTitle>
          </div>
          {description ? (
            <AlertDialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "rounded-full",
              tone === "danger" && "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
