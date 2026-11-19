import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { AccountSecurity } from "@/components/profile/AccountSecurity";
import { AppButton } from "@/components/ui/app-button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { getSession, logout } from "@/lib/auth";
import { showStatusToast } from "@/lib/feedback";
import { createLocalStore } from "@/lib/local-store";

export const Route = createFileRoute("/student/settings")({
  component: Settings,
});

type Prefs = {
  emailDigest: boolean;
  eventReminders: boolean;
  commentReplies: boolean;
  orgAnnouncements: boolean;
  showProfile: boolean;
  showOrgs: boolean;
};

const prefsStore = createLocalStore<Prefs>("umunity.student-prefs.v1", {
  emailDigest: true,
  eventReminders: true,
  commentReplies: true,
  orgAnnouncements: true,
  showProfile: true,
  showOrgs: true,
});

const SECTIONS: Array<{
  title: string;
  items: Array<{ key: keyof Prefs; label: string; hint: string }>;
}> = [
  {
    title: "Notifications",
    items: [
      {
        key: "eventReminders",
        label: "Event reminders",
        hint: "A reminder the day before events you RSVP'd to.",
      },
      {
        key: "commentReplies",
        label: "Comment replies",
        hint: "When someone replies to your comments.",
      },
      {
        key: "orgAnnouncements",
        label: "Organization announcements",
        hint: "New announcements from organizations you joined.",
      },
      {
        key: "emailDigest",
        label: "Weekly email digest",
        hint: "A Monday summary sent to your UM email.",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        key: "showProfile",
        label: "Public profile",
        hint: "Let other students view your profile page.",
      },
      {
        key: "showOrgs",
        label: "Show my organizations",
        hint: "List the organizations you belong to on your profile.",
      },
    ],
  },
];

function Settings() {
  const navigate = useNavigate();
  const prefs = prefsStore.useStore();
  const { theme, setTheme } = useTheme();
  const session = getSession();

  function setPref(key: keyof Prefs, value: boolean) {
    prefsStore.update((p) => ({ ...p, [key]: value }));
    showStatusToast("Preference saved", `${value ? "Turned on" : "Turned off"}.`);
  }

  return (
    <>
      <PageHead
        title="Settings"
        sub="Manage your student workspace preferences and notification defaults."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <Panel key={section.title} title={section.title}>
              <ul className="divide-y divide-border">
                {section.items.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <label htmlFor={`pref-${item.key}`} className="min-w-0 cursor-pointer">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    </label>
                    <Switch
                      id={`pref-${item.key}`}
                      checked={prefs[item.key]}
                      onCheckedChange={(v) => setPref(item.key, v)}
                    />
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
          <Panel title="Appearance">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="pref-dark" className="cursor-pointer">
                <span className="block text-sm font-semibold">Dark mode</span>
                <span className="block text-xs text-muted-foreground">
                  Use the maroon dark theme across UMunity.
                </span>
              </label>
              <Switch
                id="pref-dark"
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              />
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="Account">
            <p className="text-sm font-semibold">{session?.name}</p>
            <p className="text-xs text-muted-foreground">{session?.email}</p>
            <div className="mt-4 grid gap-2">
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/student/profile">Edit profile</Link>
              </AppButton>
              <AppButton asChild variant="secondary" size="sm">
                <Link to="/student/help">Get help</Link>
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  await logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </AppButton>
            </div>
          </Panel>
          <AccountSecurity />
        </aside>
      </div>
    </>
  );
}
