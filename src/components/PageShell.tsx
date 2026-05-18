import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { useForcedTheme } from "@/hooks/use-theme";

export function PageShell({
  children,
  overlayHeader = false,
  mainClassName = "",
  contentClassName = "",
}: {
  children: React.ReactNode;
  overlayHeader?: boolean;
  mainClassName?: string;
  contentClassName?: string;
}) {
  useForcedTheme("light");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className={`flex-1 ${overlayHeader ? "pt-0" : "pt-28"} ${mainClassName}`.trim()}>
        <div
          className={`mx-auto w-full ${overlayHeader ? "max-w-none px-0 py-0" : "max-w-7xl px-4 py-8 sm:px-6 lg:px-10"} ${contentClassName}`.trim()}
        >
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
