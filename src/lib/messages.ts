// Student inbox threads with organizations (saved to the database via cloud-storage).
import { createLocalStore } from "@/lib/local-store";

export type ChatMessage = { id: string; from: "me" | "org"; text: string; time: string };

export type Thread = {
  id: string;
  orgSlug: string;
  subject: string;
  unread: boolean;
  messages: ChatMessage[];
};

const store = createLocalStore<Thread[]>("umunity.messages.v1", [
  {
    id: "t-cs-summit",
    orgSlug: "cs-society",
    subject: "Innovation Summit workshop tracks",
    unread: true,
    messages: [
      { id: "m1", from: "me", text: "Hi! Will the workshop tracks at the Innovation Summit come with certificates?", time: "Yesterday, 4:10 PM" },
      { id: "m2", from: "org", text: "Yes! Full-track attendees get a certificate. Check in at the DPT lobby by 8:45 AM.", time: "Today, 9:12 AM" },
    ],
  },
  {
    id: "t-eco-run",
    orgSlug: "eco-warriors",
    subject: "Eco Run volunteer slots",
    unread: true,
    messages: [
      { id: "m1", from: "org", text: "Thanks for joining Eco Warriors! We still need marshals for the Eco Run. Interested?", time: "Today, 7:45 AM" },
    ],
  },
  {
    id: "t-theatre",
    orgSlug: "theatre-guild",
    subject: "Cultural Night auditions",
    unread: false,
    messages: [
      { id: "m1", from: "me", text: "Are auditions open to non-members?", time: "Mon, 2:30 PM" },
      { id: "m2", from: "org", text: "They are! Sign up at the Guild booth by Friday.", time: "Mon, 5:02 PM" },
    ],
  },
]);

export function markThreadRead(id: string) {
  store.update((threads) => threads.map((t) => (t.id === id ? { ...t, unread: false } : t)));
}

export function sendMessage(id: string, text: string) {
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  store.update((threads) =>
    threads.map((t) =>
      t.id === id
        ? { ...t, messages: [...t.messages, { id: `local-${Date.now()}`, from: "me", text, time: `Today, ${time}` }] }
        : t,
    ),
  );
}

export const useThreads = store.useStore;
