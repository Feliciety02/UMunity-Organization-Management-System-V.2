import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, User as UserIcon, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { login, homeFor, DEMO_USERS, type LoginResult } from "@/lib/auth";
import { authConfigFn, requestPasswordResetFn } from "@/lib/api.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandLogo } from "@/components/BrandLogo";
import umCampusHero from "@/assets/um-campus-hero.svg";
import { useForcedTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — UMunity" },
      { name: "description", content: "Sign in to your UMunity account." },
    ],
  }),
  component: Login,
});

function loginError(result: Exclude<LoginResult, { ok: true }>) {
  if (result.reason === "locked") {
    const minutes = Math.max(1, Math.ceil(result.retryAfterMs / 60000));
    return `Too many failed sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or reset your password.`;
  }
  return "Incorrect email or password.";
}

function Login() {
  const navigate = useNavigate();
  // Demo accounts only exist where the server enables them (development by default).
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => {
    authConfigFn()
      .then((cfg) => setShowDemo(cfg.demoAccounts))
      .catch(() => setShowDemo(false));
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your UM email and password.");
      return;
    }
    setSubmitting(true);
    let s: Awaited<ReturnType<typeof login>>;
    try {
      s = await login(email, password, remember);
    } catch {
      setSubmitting(false);
      setError("We couldn't reach UMunity. Check your connection and try again.");
      return;
    }
    setSubmitting(false);
    if (!s.ok) {
      setError(loginError(s));
      return;
    }
    navigate({ to: homeFor(s.session.role) });
  }

  async function quickLogin(idx: number) {
    const u = DEMO_USERS[idx];
    setEmail(u.email);
    setPassword(u.password);
    setSubmitting(true);
    try {
      const s = await login(u.email, u.password, remember);
      if (s.ok) navigate({ to: homeFor(s.session.role) });
      else setError(s.reason === "locked" ? loginError(s) : "That demo account isn't available. Try signing in manually.");
    } catch {
      setError("We couldn't reach UMunity. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back."
      sub="Sign in to continue your UMunity journey."
      footer={
        <>Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-gold hover:underline">Create one</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field icon={Mail} type="email" label="UM Email" placeholder="you@umindanao.edu.ph" value={email} onChange={(v) => { setEmail(v); setError(""); }} autoComplete="email" />
        <Field icon={Lock} type="password" label="Password" placeholder="********" value={password} onChange={(v) => { setPassword(v); setError(""); }} autoComplete="current-password" />
        {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-[var(--primary)]"
            />
            Remember me
          </label>
          <button type="button" onClick={() => setResetOpen(true)} className="font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={submitting} className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-maroon py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60">
          {submitting ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <ForgotPasswordDialog open={resetOpen} onOpenChange={setResetOpen} initialEmail={email} />

      {showDemo ? (
      <div className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-secondary/50 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <UserIcon className="h-3.5 w-3.5" /> Demo accounts
        </p>
        <div className="mt-3 grid gap-2">
          {DEMO_USERS.map((u, i) => (
            <button
              key={u.email}
              onClick={() => quickLogin(i)}
              type="button"
              className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-left text-xs transition hover:border-primary hover:shadow-soft"
            >
              <div>
                <p className="font-semibold capitalize text-foreground">{u.role}</p>
                <p className="text-muted-foreground">{u.email} · <span className="font-mono">{u.password}</span></p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>
      </div>
      ) : null}
    </AuthLayout>
  );
}

export function AuthLayout({ title, sub, footer, children }: { title: string; sub: string; footer: React.ReactNode; children: React.ReactNode }) {
  useForcedTheme("light");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-maroon text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-42"
          style={{ backgroundImage: `url(${umCampusHero})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(75,0,16,0.68)_0%,rgba(122,0,25,0.58)_48%,rgba(75,0,16,0.78)_100%)]" />
        <div className="absolute inset-0 bg-hero opacity-28" />
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2">
          <BrandLogo size={46} textClassName="text-xl text-primary-foreground" />
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            One platform for every <span className="text-gradient-gold">student organization.</span>
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Join 18,000+ Mindanaoans already building their college story on UMunity.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">© {new Date().getFullYear()} UMunity · University of Mindanao</p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-6">
        <div className="flex min-h-[680px] w-full max-w-md flex-col justify-center">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <BrandLogo size={40} textClassName="text-lg text-foreground" />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">{sub}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
}: {
  icon: LucideIcon;
  label: string;
  type: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className={`flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${error ? "border-destructive" : "border-input"}`}>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [devLink, setDevLink] = useState<string | undefined>();

  // Start fresh, with the email from the sign-in form, every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setEmail(initialEmail);
    setSent(false);
    setError("");
    setDevLink(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open, not while typing
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Reset your password</DialogTitle>
          <DialogDescription>
            {sent
              ? `If ${email.trim()} belongs to a UMunity account, a reset link is on its way. It works once and expires in 30 minutes.`
              : "Enter your UM email and we'll send you a link to set a new password."}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <>
          {devLink ? (
            <p className="rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
              Development mode (no email service configured):{" "}
              <a href={devLink} className="font-semibold text-primary underline">open the reset link</a>
            </p>
          ) : null}
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Back to sign in
            </button>
          </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                setError("Enter a valid email address.");
                return;
              }
              setSending(true);
              try {
                const res = await requestPasswordResetFn({ data: { email: email.trim() } });
                setDevLink(res.devLink);
                setSent(true);
              } catch {
                setError("We couldn't reach UMunity. Check your connection and try again.");
              } finally {
                setSending(false);
              }
            }}
            className="space-y-4"
          >
            <Field
              icon={Mail}
              type="email"
              label="UM Email"
              placeholder="you@umindanao.edu.ph"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setError("");
              }}
              autoComplete="email"
              error={error}
            />
            <DialogFooter>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send reset link"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
