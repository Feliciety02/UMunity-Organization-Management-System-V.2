export type Org = {
  slug: string;
  name: string;
  category: string;
  members: number;
  desc: string;
  color: string;
  initials: string;
};

export type OrgOfficer = {
  name: string;
  role: string;
};

export const organizations: Org[] = [
  { slug: "cs-society", name: "UM Computer Studies Society", category: "Academic", members: 3, desc: "The home of CS innovators, hackers, and future tech leaders at UM.", color: "from-primary to-primary-deep", initials: "CS" },
  { slug: "debate-council", name: "UM Debate Council", category: "Advocacy", members: 128, desc: "Sharpening minds through competitive debate and discourse.", color: "from-primary to-primary", initials: "DC" },
  { slug: "eco-warriors", name: "UM Eco Warriors", category: "Environment", members: 256, desc: "Driving sustainability and green campus initiatives.", color: "from-emerald-700 to-primary-deep", initials: "EW" },
  { slug: "theatre-guild", name: "UM Theatre Guild", category: "Arts & Culture", members: 184, desc: "Where stories come alive on stage every semester.", color: "from-rose-700 to-primary", initials: "TG" },
  { slug: "student-council", name: "UM Student Council", category: "Governance", members: 64, desc: "Representing the voice of every Mindanaoan student.", color: "from-primary-deep to-primary", initials: "SC" },
  { slug: "athletics", name: "UM Athletics League", category: "Sports", members: 320, desc: "Champions of the court, field, and beyond.", color: "from-orange-700 to-primary", initials: "AL" },
  { slug: "engineering-circle", name: "UM Engineering Circle", category: "Academic", members: 295, desc: "Building tomorrow, one prototype at a time.", color: "from-primary to-primary-deep", initials: "EC" },
  { slug: "volunteer-corps", name: "UM Volunteer Corps", category: "Community", members: 510, desc: "Service-driven students changing communities together.", color: "from-primary-deep to-rose-800", initials: "VC" },
];

export const officers: Record<string, OrgOfficer[]> = {};
