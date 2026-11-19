import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Save } from "lucide-react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { getSession, logout, type Role } from "@/lib/auth";
import { showStatusToast } from "@/lib/feedback";
import { createLocalStore } from "@/lib/local-store";
import { AccountSecurity } from "@/components/profile/AccountSecurity";

export type ProfileField = { label: string; value: string; editable?: boolean };

type Saved = Record<string, Record<string, string>>;
const store = createLocalStore<Saved>("umunity.staff-profiles.v1", {});

/**
 * Shared profile & settings page for leader, adviser, and admin roles so every
 * workspace has the same layout, editable fields, and save behaviour.
 */
export function StaffProfilePage({
  role,
  sub,
  panelTitle,
  badges,
  fields,
}: {
  role: Role;
  sub: string;
  panelTitle: string;
  badges: Array<{
    label: string;
    tone: "neutral" | "success" | "warning" | "danger" | "info" | "gold";
  }>;
  fields: ProfileField[];
}) {
  const navigate = useNavigate();
  const session = getSession();
  const saved = store.useStore()[role] ?? {};
  const { theme, setTheme } = useTheme();

  const initial = Object.fromEntries(
    fields.filter((f) => f.editable).map((f) => [f.label, saved[f.label] ?? f.value]),
  );
  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const savedKey = JSON.stringify(saved);
  useEffect(() => {
    setDraft(initial);
    // Re-sync when stored values hydrate or change in another tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey]);

  const dirty = Object.entries(draft).some(([k, v]) => v !== (initial[k] ?? ""));
  const invalid = Object.values(draft).some((v) => !v.trim());

  function save() {
    if (invalid) {
      showStatusToast("Missing details", "Editable fields can't be left empty.", "warning");
      return;
    }
    store.update((all) => ({ ...all, [role]: { ...(all[role] ?? {}), ...draft } }));
    showStatusToast("Profile saved", "Your changes have been saved.");
  }

  const displayName = draft["Full name"] ?? session?.name ?? "";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <>
      <PageHead title="Profile settings" sub={sub} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Panel>
            <div
              className={`grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${session?.avatarColor ?? "from-primary to-primary-deep"} text-2xl font-bold text-primary-foreground`}
            >
              {initials}
            </div>
            <p className="mt-4 font-display text-lg font-bold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{session?.program}</p>
            <p className="mt-2 text-xs text-muted-foreground">{session?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge key={b.label} tone={b.tone}>
                  {b.label}
                </Badge>
              ))}
            </div>
          </Panel>
          <Panel title="Preferences">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="staff-dark" className="cursor-pointer text-sm font-semibold">
                Dark mode
              </label>
              <Switch
                id="staff-dark"
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              />
            </div>
            <AppButton
              variant="ghost"
              size="sm"
              className="mt-4 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={async () => {
                await logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </AppButton>
          </Panel>
          <AccountSecurity />
        </div>

        <Panel className="lg:col-span-2" title={panelTitle}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((f) =>
                f.editable ? (
                  <label key={f.label} className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </span>
                    <input
                      value={draft[f.label] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [f.label]: e.target.value }))}
                      aria-invalid={!(draft[f.label] ?? "").trim()}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
                    />
                  </label>
                ) : (
                  <div key={f.label}>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </span>
                    <p className="rounded-xl border border-dashed border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                      {f.value || "—"}
                    </p>
                  </div>
                ),
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AppButton type="submit" variant="primary" size="md" disabled={!dirty}>
                <Save className="h-4 w-4" /> Save changes
              </AppButton>
              {dirty ? (
                <AppButton
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setDraft(initial)}
                >
                  Discard
                </AppButton>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Fields with a dashed border are managed by OSA.
                </span>
              )}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
