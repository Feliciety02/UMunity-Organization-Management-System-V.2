import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { EventCard } from "@/components/events/event-card";
import { events } from "@/data/site";
import { AppTabs } from "@/components/ui/app-tabs";
import { IconButton } from "@/components/ui/icon-button";

export const Route = createFileRoute("/student/events")({
  component: Events,
});

const tabs = ["All", "RSVP'd", "Saved", "Past"] as const;

function Events() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");

  return (
    <>
      <PageHead title="Events" sub="Discover, RSVP, and save what's next." />

      <div className="mb-5">
        <AppTabs items={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => (
          <EventCard
            key={event.title}
            event={event}
            cover={eventCovers[event.title] ?? defaultCover}
            badge={<Badge tone={index === 0 ? "success" : index === 1 ? "warning" : "info"}>{index === 0 ? "RSVP'd" : index === 1 ? "Saved" : event.status}</Badge>}
          />
        ))}
      </div>

      <Panel className="mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Event Calendar</p>
            <h3 className="mt-1 font-display text-xl font-bold">May 2026</h3>
          </div>
          <div className="flex items-center gap-2">
            <IconButton className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <IconButton className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,249,248,0.96))] p-4 shadow-soft sm:p-5">
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekdayLabels.map((day) => (
              <p key={day} className="pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {day}
              </p>
            ))}

            {calendarCells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="aspect-[0.95]" />;

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
  [events[0].title]: svgToDataUri(`
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
    </svg>
  `),
  [events[1].title]: svgToDataUri(`
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
      </g>
      <ellipse cx="600" cy="228" rx="110" ry="48" fill="#2f7c38"/>
      <circle cx="600" cy="180" r="65" fill="#56b765"/>
      <path d="M555 166 C572 144 592 137 627 139 C610 160 611 179 630 198 C606 198 586 193 568 180 C559 175 556 171 555 166 Z" fill="#2c77b8"/>
    </svg>
  `),
  [events[2].title]: svgToDataUri(`
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
    </svg>
  `),
  [events[3].title]: svgToDataUri(`
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
      </g>
      <path d="M140 50 C210 160 270 260 300 420" fill="none" stroke="#f3c35c" stroke-width="70" stroke-linecap="round"/>
    </svg>
  `),
  [events[4].title]: svgToDataUri(`
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
      </g>
      <ellipse cx="660" cy="210" rx="130" ry="22" fill="#000" opacity="0.22"/>
    </svg>
  `),
  [events[5].title]: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4b1d10"/>
          <stop offset="50%" stop-color="#8f3b17"/>
          <stop offset="100%" stop-color="#cf6e2f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="320" fill="url(#bg)"/>
      <rect y="210" width="1200" height="110" fill="#8d4e23"/>
      <circle cx="250" cy="175" r="55" fill="#d86a1f"/>
      <circle cx="540" cy="175" r="55" fill="#f4f4f4"/>
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
