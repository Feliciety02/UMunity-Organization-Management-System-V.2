import { events } from "@/data/site";

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const eventCovers: Record<string, string> = {
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

export const defaultEventCover = svgToDataUri(`
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
