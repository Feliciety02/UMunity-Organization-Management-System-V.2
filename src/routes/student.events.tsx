import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { events } from "@/data/site";
import { Bookmark, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/student/events")({
  component: Events,
});

function Events() {
  const tabs = ["All", "RSVP'd", "Saved", "Past"] as const;
  const [tab, setTab] = useState<typeof tabs[number]>("All");

  return (
    <>
      <PageHead title="Events" sub="Discover, RSVP, and save what's next." />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${tab === t ? "bg-gradient-maroon text-primary-foreground" : "bg-secondary text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e, i) => (
          <div key={e.title} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft">
            <div
              className="relative h-36 rounded-t-3xl bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${eventCovers[e.title] ?? defaultCover}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/16 via-transparent to-black/12" />
              <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-gold">
                <Bookmark className="h-4 w-4 text-primary-deep" />
              </button>
              <div className="absolute bottom-0 left-5 flex h-[68px] w-[72px] translate-y-1/2 flex-col items-center justify-center rounded-[22px] border-4 border-white bg-gradient-maroon text-center shadow-soft">
                <p className="font-display text-[2rem] font-bold leading-none text-white">{e.date.split(" ")[1].replace(",", "")}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-white/90">{e.date.split(" ")[0]}</p>
              </div>
            </div>
            <div className="p-5 pt-11">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.host}</p>
                <Badge tone={i === 0 ? "success" : i === 1 ? "warning" : "info"}>{i === 0 ? "RSVP'd" : i === 1 ? "Saved" : e.status}</Badge>
              </div>
              <h3 className="mt-2 font-display text-base font-bold">{e.title}</h3>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {e.time}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {e.venue}</p>
              </div>
              <button className="mt-4 w-full rounded-full bg-gradient-gold py-2 text-xs font-bold text-primary-deep">RSVP</button>
            </div>
          </div>
        ))}
      </div>

      <Panel className="mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Event Calendar</p>
            <h3 className="mt-1 font-display text-xl font-bold">May 2026</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,249,248,0.96))] p-4 shadow-soft sm:p-5">
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekdayLabels.map((d) => (
              <p key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {d}
              </p>
            ))}

            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="aspect-[0.95]" />;
              }

              const event = calendarEvents[cell];
              return (
                <div
                  key={cell}
                  className={`group flex aspect-[0.95] flex-col rounded-2xl border p-2.5 text-left transition ${
                    event
                      ? "border-primary/15 bg-[color:color-mix(in_oklab,var(--primary)_7%,white)] shadow-soft"
                      : "border-transparent bg-white/70 hover:border-border hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${event ? "text-primary" : "text-foreground"}`}>{cell}</span>
                    {event ? <span className={`mt-1 h-2 w-2 rounded-full ${event.dot}`} /> : null}
                  </div>

                  <div className="mt-auto min-h-[2.5rem]">
                    {event ? (
                      <>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-foreground">{event.label}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{event.time}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-transparent">.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Object.values(calendarEvents).map((event) => (
            <div key={event.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${event.dot}`} />
              <span className="font-medium text-foreground">{event.label}</span>
              <span>{event.time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarCells: Array<number | null> = [
  null, null, null, null, null, 1, 2,
  3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30,
  31, null, null, null, null, null, null,
];

const calendarEvents: Record<number, { label: string; time: string; dot: string }> = {
  24: { label: "Innovation Summit", time: "9:00 AM", dot: "bg-primary" },
  30: { label: "Eco Run", time: "5:30 AM", dot: "bg-emerald-500" },
};

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const eventCovers: Record<string, string> = {
  "UM Innovation Summit 2026": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3c0012"/>
          <stop offset="50%" stop-color="#7A0019"/>
          <stop offset="100%" stop-color="#c3173b"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="15%" r="60%">
          <stop offset="0%" stop-color="#ff6a88" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#ff6a88" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#bg)"/>
      <rect width="1200" height="320" fill="url(#glow)"/>
      <g opacity="0.28" stroke="#ffd6df" stroke-width="2">
        <path d="M40 260 L280 30"/>
        <path d="M160 300 L420 20"/>
        <path d="M330 290 L560 35"/>
        <path d="M540 300 L770 10"/>
        <path d="M760 290 L1020 20"/>
        <path d="M930 300 L1180 40"/>
      </g>
      <g fill="#240008">
        <path d="M0 245 C120 220 180 260 290 250 C390 240 470 210 580 235 C690 260 790 220 900 232 C1010 244 1100 205 1200 225 L1200 320 L0 320 Z"/>
      </g>
      <g fill="#111">
        <circle cx="110" cy="235" r="18"/><rect x="102" y="248" width="16" height="34" rx="8"/>
        <circle cx="180" cy="225" r="18"/><rect x="172" y="238" width="16" height="42" rx="8"/>
        <circle cx="300" cy="232" r="16"/><rect x="292" y="244" width="14" height="34" rx="7"/>
        <circle cx="395" cy="228" r="18"/><rect x="387" y="241" width="16" height="40" rx="8"/>
        <circle cx="515" cy="234" r="17"/><rect x="507" y="246" width="15" height="35" rx="7"/>
        <circle cx="640" cy="225" r="18"/><rect x="632" y="238" width="16" height="43" rx="8"/>
        <circle cx="780" cy="233" r="17"/><rect x="772" y="245" width="15" height="34" rx="7"/>
        <circle cx="905" cy="226" r="18"/><rect x="897" y="239" width="16" height="40" rx="8"/>
        <circle cx="1025" cy="231" r="17"/><rect x="1017" y="243" width="15" height="36" rx="7"/>
      </g>
    </svg>
  `),
  "Eco Run for the Planet": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#173a16"/>
          <stop offset="50%" stop-color="#4d8e2c"/>
          <stop offset="100%" stop-color="#b5df5f"/>
        </linearGradient>
        <radialGradient id="sun" cx="70%" cy="10%" r="55%">
          <stop offset="0%" stop-color="#fff9c2" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#fff9c2" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#sky)"/>
      <rect width="1200" height="320" fill="url(#sun)"/>
      <g fill="#2f6e24" opacity="0.92">
        <ellipse cx="70" cy="85" rx="100" ry="75"/>
        <ellipse cx="210" cy="55" rx="150" ry="90"/>
        <ellipse cx="1080" cy="80" rx="160" ry="95"/>
        <ellipse cx="930" cy="45" rx="140" ry="80"/>
      </g>
      <g fill="#1e4f1f" opacity="0.85">
        <rect x="115" y="40" width="12" height="90"/><ellipse cx="98" cy="58" rx="24" ry="12" transform="rotate(-35 98 58)"/><ellipse cx="143" cy="72" rx="24" ry="12" transform="rotate(35 143 72)"/>
        <rect x="980" y="28" width="14" height="110"/><ellipse cx="960" cy="58" rx="26" ry="13" transform="rotate(-35 960 58)"/><ellipse cx="1018" cy="78" rx="28" ry="14" transform="rotate(35 1018 78)"/>
        <rect x="220" y="28" width="12" height="84"/><ellipse cx="205" cy="42" rx="21" ry="11" transform="rotate(-35 205 42)"/><ellipse cx="245" cy="61" rx="23" ry="11" transform="rotate(35 245 61)"/>
      </g>
      <ellipse cx="600" cy="228" rx="110" ry="48" fill="#2f7c38"/>
      <circle cx="600" cy="180" r="65" fill="#56b765"/>
      <path d="M555 166 C572 144 592 137 627 139 C610 160 611 179 630 198 C606 198 586 193 568 180 C559 175 556 171 555 166 Z" fill="#2c77b8"/>
      <path d="M572 206 C587 188 605 180 642 182 C628 204 628 219 640 236 C615 236 594 234 580 224 C574 219 571 213 572 206 Z" fill="#2c77b8"/>
    </svg>
  `),
  "Battle of Bards — Debate Finals": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#120a09"/>
          <stop offset="60%" stop-color="#443126"/>
          <stop offset="100%" stop-color="#b18860"/>
        </linearGradient>
        <radialGradient id="spot" cx="60%" cy="0%" r="60%">
          <stop offset="0%" stop-color="#f4d8a7" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#f4d8a7" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#bg)"/>
      <rect width="1200" height="320" fill="url(#spot)"/>
      <rect y="250" width="1200" height="70" fill="#1b120f"/>
      <ellipse cx="790" cy="230" rx="165" ry="25" fill="#000" opacity="0.35"/>
      <rect x="760" y="105" width="70" height="120" rx="4" fill="#3b291f"/>
      <rect x="720" y="128" width="150" height="18" rx="4" fill="#55372a"/>
      <rect x="789" y="62" width="12" height="80" fill="#2a211b"/>
      <circle cx="795" cy="58" r="16" fill="#111"/>
      <rect x="930" y="118" width="12" height="95" fill="#2a211b"/>
      <ellipse cx="936" cy="214" rx="45" ry="10" fill="#000" opacity="0.3"/>
      <path d="M892 118 L980 118 L958 178 L914 178 Z" fill="#5b4235"/>
      <g opacity="0.22" stroke="#f0dcc0" stroke-width="8">
        <path d="M95 20 L155 210"/>
        <path d="M250 10 L310 205"/>
      </g>
    </svg>
  `),
  "Cultural Night: Roots & Rhythm": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#9c2d12"/>
          <stop offset="50%" stop-color="#e07b22"/>
          <stop offset="100%" stop-color="#2a5ca8"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#bg)"/>
      <g opacity="0.28" fill="#ffd77e">
        <circle cx="1000" cy="85" r="48"/><circle cx="1065" cy="132" r="28"/><circle cx="930" cy="140" r="36"/>
        <circle cx="820" cy="70" r="24"/><circle cx="860" cy="120" r="18"/>
      </g>
      <g transform="translate(80 30)">
        <path d="M190 0 C110 28 74 112 96 206 C108 254 136 281 184 286 C218 289 246 274 262 248 C286 210 278 168 228 122 C191 88 174 61 190 0 Z" fill="#7b2d18"/>
        <path d="M197 10 C142 36 118 99 134 177 C144 226 171 255 208 257 C230 258 252 244 264 221 C280 189 271 152 231 116 C204 92 189 61 197 10 Z" fill="#d79a3a"/>
        <circle cx="215" cy="142" r="7" fill="#6a240d"/>
        <circle cx="196" cy="170" r="7" fill="#6a240d"/>
        <circle cx="225" cy="194" r="7" fill="#6a240d"/>
      </g>
      <g transform="translate(590 36)">
        <ellipse cx="68" cy="212" rx="70" ry="20" fill="#000" opacity="0.2"/>
        <rect x="36" y="46" width="62" height="170" rx="8" fill="#0c5b8c"/>
        <rect x="54" y="76" width="8" height="140" fill="#ffd6b0"/>
        <rect x="70" y="76" width="8" height="140" fill="#ffd6b0"/>
        <rect x="86" y="76" width="8" height="140" fill="#ffd6b0"/>
        <path d="M42 46 L94 10 L104 40 L56 72 Z" fill="#f4b000"/>
      </g>
      <g transform="translate(850 62)">
        <rect x="0" y="150" width="110" height="20" rx="6" fill="#4b291a"/>
        <rect x="15" y="30" width="16" height="125" fill="#84522e"/>
        <rect x="48" y="10" width="16" height="145" fill="#84522e"/>
        <rect x="81" y="40" width="16" height="115" fill="#84522e"/>
        <path d="M8 150 C12 112 24 92 44 64 C52 85 57 115 58 150 Z" fill="#d12f3f"/>
        <path d="M42 150 C46 92 55 67 75 36 C86 73 92 111 94 150 Z" fill="#1a8f7a"/>
        <path d="M74 150 C79 116 90 95 108 69 C116 88 120 117 120 150 Z" fill="#f4b000"/>
      </g>
    </svg>
  `),
  "Leadership Bootcamp": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#372d67"/>
          <stop offset="50%" stop-color="#c24f62"/>
          <stop offset="100%" stop-color="#ffb25c"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#sky)"/>
      <g fill="#402f5a" opacity="0.92">
        <path d="M0 240 L120 145 L225 242 Z"/>
        <path d="M145 240 L330 90 L475 240 Z"/>
        <path d="M390 240 L610 110 L840 240 Z"/>
        <path d="M700 240 L920 70 L1200 240 Z"/>
      </g>
      <rect y="240" width="1200" height="80" fill="#241a2b"/>
      <ellipse cx="660" cy="210" rx="130" ry="22" fill="#000" opacity="0.22"/>
      <path d="M600 235 L660 150 L685 235 Z" fill="#121212"/>
      <circle cx="658" cy="128" r="18" fill="#121212"/>
      <rect x="650" y="145" width="16" height="60" rx="8" fill="#121212"/>
      <path d="M650 170 L610 186 L616 198 L651 188 Z" fill="#121212"/>
      <path d="M662 162 L695 132 L704 142 L668 172 Z" fill="#121212"/>
      <path d="M653 205 L630 240 L642 240 L660 216 Z" fill="#121212"/>
      <path d="M664 205 L688 240 L702 240 L672 214 Z" fill="#121212"/>
    </svg>
  `),
  "Inter-Org Sportsfest": svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4b1d10"/>
          <stop offset="50%" stop-color="#8f3b17"/>
          <stop offset="100%" stop-color="#cf6e2f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#bg)"/>
      <g opacity="0.28" stroke="#f6c08d" stroke-width="4">
        <path d="M80 0 L260 320"/><path d="M220 0 L400 320"/><path d="M890 0 L1070 320"/><path d="M1030 0 L1210 320"/>
      </g>
      <rect y="210" width="1200" height="110" fill="#8d4e23"/>
      <g transform="translate(250 120)">
        <circle cx="0" cy="55" r="55" fill="#d86a1f"/>
        <path d="M-52 55 H52 M0 3 C18 22 18 88 0 107 M-40 19 C-8 35 -8 75 -40 91 M40 19 C8 35 8 75 40 91" stroke="#4d240f" stroke-width="5" fill="none"/>
      </g>
      <g transform="translate(540 120)">
        <circle cx="0" cy="55" r="55" fill="#f4f4f4"/>
        <polygon points="0,18 17,31 10,51 -10,51 -17,31" fill="#111"/>
        <polygon points="-35,39 -18,52 -24,73 -45,73 -51,52" fill="#111"/>
        <polygon points="35,39 51,52 45,73 24,73 18,52" fill="#111"/>
      </g>
      <g transform="translate(860 160) rotate(-12)">
        <ellipse cx="0" cy="0" rx="62" ry="16" fill="#000" opacity="0.25"/>
        <ellipse cx="0" cy="-10" rx="60" ry="14" fill="#b84b1d"/>
        <ellipse cx="0" cy="-10" rx="42" ry="8" fill="#f2d8b0"/>
        <line x1="-48" y1="-10" x2="48" y2="-10" stroke="#f2d8b0" stroke-width="3"/>
        <line x1="0" y1="-62" x2="0" y2="42" stroke="#f2d8b0" stroke-width="3"/>
      </g>
    </svg>
  `),
};

const defaultCover = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4b1020"/>
        <stop offset="100%" stop-color="#a11d35"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="320" fill="url(#bg)"/>
  </svg>
`);
