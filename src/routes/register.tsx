import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field } from "@/routes/login";
import { Mail, Lock, User, GraduationCap, ArrowRight } from "lucide-react";
import { homeFor, registerStudent } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — UMunity" },
      { name: "description", content: "Create your UMunity account and join campus life." },
    ],
  }),
  component: Register,
});

type Form = { name: string; email: string; program: string; password: string; agree: boolean };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const errors: Errors = {};
  if (f.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@(umindanao\.edu\.ph|um\.edu\.ph)$/i.test(f.email.trim())) errors.email = "Use your UM email (@umindanao.edu.ph).";
  if (!f.program.trim()) errors.program = "Enter your program and year.";
  if (f.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!f.agree) errors.agree = "Please accept the Terms of Service to continue.";
  return errors;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ name: "", email: "", program: "", password: "", agree: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ field: "email" | "form"; error: string; email: string } | null>(null);
  const errors: Errors = submitted ? validate(form) : {};
  // The "email taken" error from the server applies until the email is edited.
  if (serverError?.field === "email" && serverError.email === form.email && !errors.email) errors.email = serverError.error;
  const set = <K extends keyof Form>(key: K) => (value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate(form)).length > 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const result = await registerStudent(form);
      if (result.ok) {
        navigate({ to: homeFor(result.session.role) });
        return;
      }
      setServerError({ field: result.field, error: result.error, email: form.email });
    } catch {
      setServerError({ field: "form", error: "We couldn't reach UMunity. Check your connection and try again.", email: form.email });
    }
    setSubmitting(false);
  }

  return (
    <AuthLayout
      title="Join UMunity."
      sub="Create your free student account in seconds."
      footer={
        <>Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gold hover:underline">Sign in</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <Field icon={User} type="text" label="Full Name" placeholder="Juan dela Cruz" value={form.name} onChange={set("name")} autoComplete="name" error={errors.name} />
        <Field icon={Mail} type="email" label="UM Email" placeholder="you@umindanao.edu.ph" value={form.email} onChange={set("email")} autoComplete="email" error={errors.email} />
        <Field icon={GraduationCap} type="text" label="Program / Year" placeholder="BS Computer Science · 2nd Year" value={form.program} onChange={set("program")} error={errors.program} />
        <Field icon={Lock} type="password" label="Password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} autoComplete="new-password" error={errors.password} />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => set("agree")(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--primary)]"
          />
          I agree to the UMunity Terms of Service and acknowledge the Privacy Policy.
        </label>
        {errors.agree ? <p className="-mt-2 text-xs text-destructive">{errors.agree}</p> : null}
        {serverError?.field === "form" ? <p role="alert" className="text-xs text-destructive">{serverError.error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-maroon py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </AuthLayout>
  );
}
