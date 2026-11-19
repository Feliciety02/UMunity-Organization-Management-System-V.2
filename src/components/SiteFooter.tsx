import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-maroon text-primary-foreground">
      <div className="absolute inset-0 bg-hero opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <BrandLogo
                size={48}
                textClassName="text-xl text-primary-foreground"
                imageClassName="drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
              />
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/80">
              One platform for every student organization at the University of Mindanao. Discover,
              connect, and thrive.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-deep transition hover:brightness-95"
            >
              Create your account
            </Link>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-gold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/organizations">Organizations</Link>
              </li>
              <li>
                <Link to="/events">Events</Link>
              </li>
              <li>
                <Link to="/features">Features</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-gold">Account</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-primary-foreground/70 md:flex-row">
          <p>
            © {new Date().getFullYear()} UMunity. Built for the University of Mindanao community.
          </p>
          <p>One Platform for Every Student Organization.</p>
        </div>
      </div>
    </footer>
  );
}
