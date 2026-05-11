import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — UMUnity" },
      { name: "description", content: "Sign in to your UMUnity account." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <AuthLayout
      title="Welcome back."
      sub="Sign in to continue your UMUnity journey."
      footer={
        <>Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-gold hover:underline">Create one</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field icon={Mail} type="email" label="UM Email" placeholder="you@umindanao.edu.ph" />
        <Field icon={Lock} type="password" label="Password" placeholder="••••••••" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-[var(--primary)]" />
            Remember me
          </label>
          <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
        </div>
        <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-maroon py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]">
          Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ title, sub, footer, children }: { title: string; sub: string; footer: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-maroon text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <span className="font-display text-xl font-bold">UMUnity</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            One platform for every <span className="text-gradient-gold">student organization.</span>
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Join 18,000+ Mindanaoans already building their college story on UMUnity.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">© {new Date().getFullYear()} UMUnity · University of Mindanao</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-maroon">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <span className="font-display text-lg font-bold">UMUnity</span>
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

export function Field({ icon: Icon, label, type, placeholder }: { icon: any; label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </label>
  );
}
