import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, Moon, Sun } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/hooks/use-theme";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/organizations", label: "Organizations" },
  { to: "/events", label: "Events" },
  { to: "/features", label: "Features" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncScrolled = () => setScrolled(window.scrollY > 40);

    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });

    return () => window.removeEventListener("scroll", syncScrolled);
  }, []);

  const shellClass = scrolled
    ? "border-[rgba(231,220,200,0.8)] bg-[rgba(255,255,255,0.86)] text-[#1E1B16] shadow-[0_16px_40px_rgba(75,0,16,0.12)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(255,255,255,0.82)]"
    : "border-white/28 bg-[rgba(75,0,16,0.44)] text-[#FFFDF7] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(75,0,16,0.38)]";
  const controlClass = scrolled
    ? "border-[rgba(122,0,25,0.08)] bg-[rgba(255,255,255,0.58)] text-[#1E1B16] hover:bg-[rgba(255,255,255,0.82)]"
    : "border-white/16 bg-[rgba(255,255,255,0.14)] text-[#FFFDF7] hover:bg-white/18";
  const textShadowClass = scrolled ? "" : "drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]";

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] px-4 pt-0 transition-all duration-250 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div
          className={`navbar ${scrolled ? "is-scrolled" : ""} mt-3 flex items-center justify-between gap-3 rounded-[999px] border px-3 py-3 transition-all duration-250 sm:mt-4 ${shellClass}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setOpen((value) => !value)}
              className={`grid h-11 w-11 place-items-center rounded-full border transition md:hidden ${controlClass}`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className={`group flex min-w-0 items-center gap-2 rounded-full px-2 py-1 ${textShadowClass}`}>
              <BrandLogo
                size={42}
                imageClassName="drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                textClassName={`logo-text text-lg ${scrolled ? "text-[#7A0019]" : "text-[#FFFDF7]"}`}
              />
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`grid h-11 w-11 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${controlClass}`}
            >
              {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <Link
              to="/login"
              className="rounded-full bg-[rgba(122,0,25,0.88)] px-5 py-2.5 text-sm font-semibold text-[#FFFDF7] shadow-[0_10px_24px_rgba(75,0,16,0.16)] transition hover:bg-[rgba(122,0,25,0.96)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4B000] px-5 py-2.5 text-sm font-semibold text-[#4B0010] shadow-[0_12px_30px_rgba(244,176,0,0.24)] transition hover:bg-[#FFC72C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-[1400px] rounded-[1.75rem] border border-white/16 bg-[rgba(75,0,16,0.92)] p-4 text-[#FFFDF7] shadow-[0_18px_60px_rgba(34,8,12,0.28)] backdrop-blur-xl md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <BrandLogo size={38} textClassName="text-base text-[#FFFDF7]" />
            <button
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/14 bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-[#FFFDF7]/88 transition hover:bg-white/10"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-white/18 bg-white/10 px-4 py-3 text-center text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-[#F4B000] px-4 py-3 text-center text-sm font-semibold text-[#4B0010]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
