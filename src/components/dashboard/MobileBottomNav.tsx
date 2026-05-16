import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type BottomNavItem = { to: string; label: string; icon: LucideIcon; badge?: string };

export function MobileBottomNav({ items }: { items: BottomNavItem[] }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.slice(0, 5).map((item) => {
          const active = path === item.to || (item.to.split("/").length > 2 && path.startsWith(item.to));
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="leading-none">{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-3 top-1.5 min-w-4 rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
