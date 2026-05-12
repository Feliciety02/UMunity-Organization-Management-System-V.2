export type Org = {
  slug: string;
  name: string;
  category: string;
  members: number;
  desc: string;
  color: string;
  initials: string;
};

export const organizations: Org[] = [
  { slug: "cs-society", name: "UM Computer Studies Society", category: "Academic", members: 412, desc: "The home of CS innovators, hackers, and future tech leaders at UM.", color: "from-primary to-primary-deep", initials: "CS" },
  { slug: "debate-council", name: "UM Debate Council", category: "Advocacy", members: 128, desc: "Sharpening minds through competitive debate and discourse.", color: "from-amber-600 to-primary", initials: "DC" },
  { slug: "eco-warriors", name: "UM Eco Warriors", category: "Environment", members: 256, desc: "Driving sustainability and green campus initiatives.", color: "from-emerald-700 to-primary-deep", initials: "EW" },
  { slug: "theatre-guild", name: "UM Theatre Guild", category: "Arts & Culture", members: 184, desc: "Where stories come alive on stage every semester.", color: "from-rose-700 to-primary", initials: "TG" },
  { slug: "student-council", name: "UM Student Council", category: "Governance", members: 64, desc: "Representing the voice of every Mindanaoan student.", color: "from-primary-deep to-primary", initials: "SC" },
  { slug: "athletics", name: "UM Athletics League", category: "Sports", members: 320, desc: "Champions of the court, field, and beyond.", color: "from-orange-700 to-primary", initials: "AL" },
  { slug: "engineering-circle", name: "UM Engineering Circle", category: "Academic", members: 295, desc: "Building tomorrow, one prototype at a time.", color: "from-primary to-amber-700", initials: "EC" },
  { slug: "volunteer-corps", name: "UM Volunteer Corps", category: "Community", members: 510, desc: "Service-driven students changing communities together.", color: "from-primary-deep to-rose-800", initials: "VC" },
];

export const events = [
  { title: "UM Innovation Summit 2026", date: "May 24, 2026", time: "9:00 AM", venue: "DPT Building Auditorium", host: "UM Computer Studies Society", status: "Open" },
  { title: "Eco Run for the Planet", date: "May 30, 2026", time: "5:30 AM", venue: "UM Matina Track Oval", host: "UM Eco Warriors", status: "Open" },
  { title: "Battle of Bards — Debate Finals", date: "June 5, 2026", time: "1:00 PM", venue: "Bolton Hall", host: "UM Debate Council", status: "Filling Fast" },
  { title: "Cultural Night: Roots & Rhythm", date: "June 12, 2026", time: "6:00 PM", venue: "UM Gymnasium", host: "UM Theatre Guild", status: "Open" },
  { title: "Leadership Bootcamp", date: "June 18, 2026", time: "8:00 AM", venue: "Student Center", host: "UM Student Council", status: "Soon" },
  { title: "Inter-Org Sportsfest", date: "June 25, 2026", time: "7:00 AM", venue: "UM Sports Complex", host: "UM Athletics League", status: "Open" },
];

export const stats = [
  { value: "120+", label: "Student Orgs" },
  { value: "18k", label: "Active Members" },
  { value: "450+", label: "Events Hosted" },
  { value: "98%", label: "Satisfaction" },
];

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

export const officers: Record<string, { name: string; role: string }[]> = {
  "cs-society": [
    { name: "Marco Reyes", role: "President" },
    { name: "Anna Sy", role: "Vice President" },
    { name: "Karl Mendez", role: "Secretary" },
    { name: "Jules Tan", role: "Treasurer" },
    { name: "Pia Lim", role: "PRO" },
    { name: "Prof. Tan", role: "Adviser" },
  ],
};
