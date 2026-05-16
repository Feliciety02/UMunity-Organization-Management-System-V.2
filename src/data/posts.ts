export type Comment = {
  id: string;
  author: string;
  program?: string;
  text: string;
  time: string;
  replies?: Comment[];
};

export type Post = {
  id: string;
  orgSlug: string;
  type: "event" | "announcement" | "general";
  pinned?: boolean;
  visibility: "public" | "members";
  time: string;
  title?: string;
  content: string;
  image?: string; // url or placeholder gradient name
  likes: number;
  comments: Comment[];
};

export const posts: Post[] = [
  {
    id: "p1",
    orgSlug: "cs-society",
    type: "event",
    pinned: true,
    visibility: "public",
    time: "2h ago",
    title: "UM Innovation Summit 2026 — Registration Open",
    content:
      "Three days of talks, workshops, and hackathons with industry mentors. Open to all UM students. Limited slots for the build track — RSVP early!",
    image: "from-primary to-primary-deep",
    likes: 184,
    comments: [
      { id: "c1", author: "Jana Cruz", program: "BS IT · 2nd Yr", text: "Sulit ‘to last year, joining again!", time: "1h" },
      { id: "c2", author: "Marvin Lim", program: "BS CS · 1st Yr", text: "Will the workshop tracks have certificates?", time: "30m",
        replies: [{ id: "c2r1", author: "UM CS Society", text: "Yes! Certificates for full-track attendees.", time: "20m" }] },
    ],
  },
  {
    id: "p2",
    orgSlug: "eco-warriors",
    type: "announcement",
    visibility: "public",
    time: "Yesterday",
    title: "Plastic-Free May results",
    content:
      "Together we diverted 412 kg of single-use plastic from campus waste this month. Massive thanks to every volunteer 🌱",
    image: "from-emerald-700 to-primary-deep",
    likes: 96,
    comments: [
      { id: "c3", author: "Ria Santos", program: "BS IS · 3rd Yr", text: "Proud to be part of this!", time: "5h" },
    ],
  },
  {
    id: "p3",
    orgSlug: "debate-council",
    type: "general",
    visibility: "public",
    time: "2 days ago",
    content:
      "Open tryouts for the inter-uni team this Friday at Bolton Hall, 4pm. No experience needed — bring an argument and an open mind.",
    likes: 42,
    comments: [],
  },
  {
    id: "p4",
    orgSlug: "theatre-guild",
    type: "event",
    visibility: "public",
    time: "3 days ago",
    title: "Cultural Night auditions",
    content: "Singers, dancers, and stage crew — sign up at the Guild office until Friday. Callbacks on Saturday.",
    image: "from-rose-700 to-primary",
    likes: 71,
    comments: [],
  },
];
