import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { login, homeFor, DEMO_USERS } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import umCampusHero from "@/assets/um-campus-hero.svg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - UMunity" },
      { name: "description", content: "Sign in to your UMunity account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const s = login(email, password);
    if (!s) {
      setError("Invalid credentials. Try a demo account below.");
      return;
    }
    navigate({ to: homeFor(s.role) });
  }

  function quickLogin(idx: number) {
    const u = DEMO_USERS[idx];
    setEmail(u.email);
    setPassword(u.password);
    const s = login(u.email, u.password);
    if (s) navigate({ to: homeFor(s.role) });
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
        <Field icon={Mail} type="email" label="UM Email" placeholder="you@umindanao.edu.ph" value={email} onChange={setEmail} />
        <Field icon={Lock} type="password" label="Password" placeholder="********" value={password} onChange={setPassword} />
        {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
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
                <p className="text-muted-foreground">{u.email} - <span className="font-mono">{u.password}</span></p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({ title, sub, footer, children }: { title: string; sub: string; footer: React.ReactNode; children: React.ReactNode }) {
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
        <p className="relative text-xs text-primary-foreground/60">(c) {new Date().getFullYear()} UMunity - University of Mindanao</p>
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

export function Field({ icon: Icon, label, type, placeholder, value, onChange }: { icon: any; label: string; type: string; placeholder: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </label>
  );
}
