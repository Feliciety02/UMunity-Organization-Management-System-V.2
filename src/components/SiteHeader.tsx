import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search, Bell, MessageSquare } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/organizations", label: "Organizations" },
  { to: "/events", label: "Events" },
  { to: "/features", label: "Features" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#FEFDFE]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary text-foreground md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="group flex items-center gap-2">
            <BrandLogo size={40} textClassName="text-lg text-foreground" />
          </Link>
        </div>

        <div className="hidden flex-1 md:flex md:max-w-md">
          <div className="flex w-full items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search for organizations, events, posts..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card transition hover:bg-secondary">
            <Bell className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card transition hover:bg-secondary">
            <MessageSquare className="h-4 w-4" />
          </button>
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:text-primary"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-semibold text-primary-deep shadow-soft"
          >
            Get Started
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-[#FEFDFE] md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-border px-4 py-2 text-center text-sm font-medium">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-gradient-gold px-4 py-2 text-center text-sm font-semibold text-primary-deep">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
