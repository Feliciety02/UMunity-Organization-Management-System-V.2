import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export type OrgLinkMode = "public" | "student" | "leader" | "admin";

export function OrgLink({
  slug,
  mode = "public",
  children,
  className,
  target,
  title,
}: {
  slug: string;
  mode?: OrgLinkMode;
  children: ReactNode;
  className?: string;
  target?: string;
  title?: string;
}) {
  if (mode === "student") {
    return (
      <Link to="/student/org/$slug" params={{ slug }} className={className} target={target} title={title}>
        {children}
      </Link>
    );
  }

  if (mode === "leader") {
    return (
      <Link to="/leader/organization" className={className} target={target} title={title}>
        {children}
      </Link>
    );
  }

  if (mode === "admin") {
    return (
      <Link to="/admin/organizations" className={className} target={target} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/org/$slug" params={{ slug }} className={className} target={target} title={title}>
      {children}
    </Link>
  );
}
