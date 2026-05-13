import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, StatCard, Badge } from "@/components/dashboard/DashboardLayout";
import { Flag, MessageSquare, Building2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/moderation")({
  component: Moderation,
});

function Moderation() {
  return (
    <>
      <PageHead title="Content moderation" sub="Review reports, verify orgs, and keep UMunity safe." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reported posts" value="9" delta="+3 today" icon={Flag} tone="rose" />
        <StatCard label="Reported comments" value="14" icon={MessageSquare} tone="gold" />
        <StatCard label="Orgs to verify" value="5" icon={Building2} tone="primary" />
        <StatCard label="Resolved this week" value="42" icon={ShieldCheck} tone="emerald" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card title="Reported posts" to="/admin/reported-posts" badge="9" desc="Posts flagged by students or auto-detected." />
        <Card title="Reported comments" to="/admin/reported-comments" badge="14" desc="Comment threads needing review." />
        <Card title="Organization review" to="/admin/organizations" badge="5" desc="Verify new orgs and re-check profiles." />
      </div>
    </>
  );
}

function Card({ title, to, badge, desc }: { title: string; to: any; badge: string; desc: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-card p-5 shadow-soft hover:bg-secondary/40">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <Badge tone="warning">{badge}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
