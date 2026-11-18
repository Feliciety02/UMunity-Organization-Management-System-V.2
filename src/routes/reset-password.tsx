import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { AuthLayout, Field } from "@/routes/login";
import { resetPasswordFn } from "@/lib/api.functions";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>): { token?: string } => (typeof s.token === "string" ? { token: s.token } : {}),
  head: () => ({
    meta: [
      { title: "Reset password — UMunity" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const pwError = submitted && password.length < 8 ? "Use at least 8 characters." : undefined;
  const confirmError = submitted && confirm !== password ? "The passwords don't match." : undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (password.length < 8 || confirm !== password || !token) return;
    setSaving(true);
    try {
      const res = await resetPasswordFn({ data: { token, password } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      showStatusToast("Password updated", "Sign in with your new password.");
      navigate({ to: "/login" });
    } catch {
      setError("We couldn't reach UMunity. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthLayout
      title="Set a new password."
      sub="Choose a password you don't use anywhere else."
      footer={
        <>Remembered it?{" "}
          <Link to="/login" className="font-semibold text-gold hover:underline">Sign in</Link>
        </>
      }
    >
      {!token ? (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This reset link is incomplete. Request a new one from the sign-in page.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={submit} noValidate>
          <Field icon={Lock} type="password" label="New password" placeholder="At least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" error={pwError} />
          <Field icon={Lock} type="password" label="Confirm new password" placeholder="Type it again" value={confirm} onChange={setConfirm} autoComplete="new-password" error={confirmError} />
          {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-maroon py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update password"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
