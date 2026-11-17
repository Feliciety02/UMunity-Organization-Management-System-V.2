import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { PageHead, Panel } from "@/components/dashboard/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AppButton } from "@/components/ui/app-button";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/student/help")({
  component: Help,
});

const FAQ: Array<{ q: string; a: string; link?: { to: string; label: string } }> = [
  {
    q: "How do I join an organization?",
    a: "Open Explore, pick an organization, and press Join. The organization's officers review your request; it shows as Requested on My Organizations until they respond.",
    link: { to: "/student/explore", label: "Go to Explore" },
  },
  {
    q: "How do I RSVP to an event?",
    a: "On any event card, open the RSVP menu and choose Going or Maybe. Your RSVP'd events are listed under the RSVP'd tab on the Events page.",
    link: { to: "/student/events", label: "Open Events" },
  },
  {
    q: "Where do my saved posts and events go?",
    a: "Tap the bookmark icon on a post or event. Saved posts appear on the Saved page, and saved events under the Saved tab on Events.",
    link: { to: "/student/saved", label: "Open Saved" },
  },
  {
    q: "How do I turn notifications on or off?",
    a: "Use Settings to choose which reminders and announcements you receive.",
    link: { to: "/student/settings", label: "Open Settings" },
  },
  {
    q: "I can't sign in to my account.",
    a: "Use your UM email. If you forgot your password, use 'Forgot password?' on the sign-in page, or contact the Office of Student Affairs.",
  },
];

const TOPICS = ["Account access", "Organizations", "Events & RSVPs", "Report a problem"] as const;

function Help() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }
    setError("");
    setMessage("");
    showStatusToast("Request sent", `The OSA support desk received your "${topic}" request and will reply to your UM email.`);
  }

  return (
    <>
      <PageHead title="Help" sub="Get support for account access, organizations, events, and campus activity." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Frequently asked questions">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-sm font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>{item.a}</p>
                  {item.link ? (
                    <Link to={item.link.to} className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                      {item.link.label}
                    </Link>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>

        <Panel title="Contact support">
          <form onSubmit={submit} className="space-y-3" noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!error}
                placeholder="Tell us what's going on..."
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
              />
              {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
            </label>
            <AppButton type="submit" variant="primary" size="md" className="w-full">
              <Send className="h-4 w-4" /> Send request
            </AppButton>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LifeBuoy className="h-3.5 w-3.5" /> OSA support replies within 1-2 school days.
            </p>
          </form>
        </Panel>
      </div>
    </>
  );
}
