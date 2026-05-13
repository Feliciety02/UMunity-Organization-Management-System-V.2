import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout, Field } from "@/routes/login";
import { Mail, Lock, User, GraduationCap, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — UMunity" },
      { name: "description", content: "Create your UMunity account and join campus life." },
    ],
  }),
  component: Register,
});

function Register() {
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
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field icon={User} type="text" label="Full Name" placeholder="Juan dela Cruz" />
        <Field icon={Mail} type="email" label="UM Email" placeholder="you@umindanao.edu.ph" />
        <Field icon={GraduationCap} type="text" label="Program / Year" placeholder="BS Computer Science · 2nd Year" />
        <Field icon={Lock} type="password" label="Password" placeholder="At least 8 characters" />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--primary)]" />
          I agree to the UMunity Terms of Service and acknowledge the Privacy Policy.
        </label>
        <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-maroon py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]">
          Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </AuthLayout>
  );
}
