import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Mail, Trash2 } from "lucide-react";
import { Panel } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { changeEmailFn, changePasswordFn, deleteAccountFn } from "@/lib/api.functions";
import { forgetLocalSession, getSession, updateLocalSession } from "@/lib/auth";
import { showStatusToast } from "@/lib/feedback";

type Mode = "email" | "password" | "delete" | null;

const UM_EMAIL = /^[^\s@]+@(umindanao\.edu\.ph|um\.edu\.ph)$/i;
const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";

/** Change email, change password and delete account: shared by student settings and staff profiles. */
export function AccountSecurity({ onEmailChanged }: { onEmailChanged?: (email: string) => void }) {
  const [mode, setMode] = useState<Mode>(null);
  const email = getSession()?.email ?? "";

  return (
    <Panel title="Account & security">
      <p className="text-xs text-muted-foreground">Signed in as</p>
      <p className="truncate text-sm font-semibold">{email}</p>
      <div className="mt-4 grid gap-2">
        <AppButton variant="secondary" size="sm" onClick={() => setMode("email")}>
          <Mail className="h-4 w-4" /> Change email
        </AppButton>
        <AppButton variant="secondary" size="sm" onClick={() => setMode("password")}>
          <KeyRound className="h-4 w-4" /> Change password
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setMode("delete")}
        >
          <Trash2 className="h-4 w-4" /> Delete account
        </AppButton>
      </div>
      <SecurityDialog
        mode={mode}
        onClose={() => setMode(null)}
        currentEmail={email}
        onEmailChanged={onEmailChanged}
      />
    </Panel>
  );
}

function SecurityDialog({
  mode,
  onClose,
  currentEmail,
  onEmailChanged,
}: {
  mode: Mode;
  onClose: () => void;
  currentEmail: string;
  onEmailChanged?: (email: string) => void;
}) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setPassword("");
    setNext("");
    setConfirm("");
    setSubmitted(false);
    setError("");
    setBusy(false);
  }

  const fieldError = (() => {
    if (!submitted) return "";
    if (!password) return "Enter your current password.";
    if (mode === "email" && !UM_EMAIL.test(next.trim()))
      return "Use your UM email (@umindanao.edu.ph).";
    if (mode === "password" && next.length < 8)
      return "Use at least 8 characters for the new password.";
    if (mode === "password" && next !== confirm) return "The new passwords don't match.";
    if (mode === "delete" && confirm !== "DELETE") return "Type DELETE to confirm.";
    return "";
  })();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    const invalid =
      !password ||
      (mode === "email" && !UM_EMAIL.test(next.trim())) ||
      (mode === "password" && (next.length < 8 || next !== confirm)) ||
      (mode === "delete" && confirm !== "DELETE");
    if (invalid) return;
    setBusy(true);
    try {
      if (mode === "email") {
        const res = await changeEmailFn({ data: { password, email: next.trim() } });
        if (!res.ok) return setError(res.error);
        updateLocalSession(res.session);
        onEmailChanged?.(res.session.email);
        showStatusToast("Email updated", `Sign in with ${res.session.email} from now on.`);
      } else if (mode === "password") {
        const res = await changePasswordFn({ data: { current: password, next } });
        if (!res.ok) return setError(res.error);
        showStatusToast("Password changed", "You've been signed out on your other devices.");
      } else if (mode === "delete") {
        const res = await deleteAccountFn({ data: { password } });
        if (!res.ok) return setError(res.error);
        forgetLocalSession();
        showStatusToast(
          "Account deleted",
          "Your UMunity account and personal data were removed.",
          "info",
        );
        navigate({ to: "/" });
      }
      reset();
      onClose();
    } catch {
      setError("We couldn't reach UMunity. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "email"
      ? "Change email"
      : mode === "password"
        ? "Change password"
        : "Delete your account?";
  const description =
    mode === "email"
      ? `You currently sign in with ${currentEmail}.`
      : mode === "password"
        ? "Other devices will be signed out."
        : "This permanently removes your account, memberships, saved items and messages. It can't be undone.";

  return (
    <Dialog
      open={mode !== null}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={submit} noValidate>
          {mode === "email" ? (
            <label className="block text-sm font-semibold">
              New UM email
              <input
                type="email"
                autoComplete="email"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={`mt-1.5 ${inputCls}`}
              />
            </label>
          ) : null}
          <label className="block text-sm font-semibold">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1.5 ${inputCls}`}
            />
          </label>
          {mode === "password" ? (
            <>
              <label className="block text-sm font-semibold">
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
              <label className="block text-sm font-semibold">
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
            </>
          ) : null}
          {mode === "delete" ? (
            <label className="block text-sm font-semibold">
              Type DELETE to confirm
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`mt-1.5 ${inputCls}`}
              />
            </label>
          ) : null}
          {fieldError || error ? (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
            >
              {error || fieldError}
            </p>
          ) : null}
          <DialogFooter>
            <AppButton type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              disabled={busy}
              className={mode === "delete" ? "bg-destructive hover:bg-destructive/90" : undefined}
            >
              {busy ? "Working..." : mode === "delete" ? "Delete account" : "Save"}
            </AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
