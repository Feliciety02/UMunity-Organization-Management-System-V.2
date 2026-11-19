// Small shared helpers for ids, names and codes. Pure (no imports), so the server, the browser and
// the tests all get the same answers. One copy of each, so codes like "UMCSS" never drift apart.

/** A unique id such as "comment-1794962080080-221tn". */
export function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** "UM Eco Warriors" -> "um-eco-warriors". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "UM Computer Studies Society" -> "UMCSS", "UM Cultural Guild" -> "UMCG". */
export function orgShortFor(name: string | undefined) {
  if (!name) return "";
  const words = name.split(/\s+/).filter(Boolean);
  const [first, ...rest] = words;
  return first === "UM"
    ? `UM${rest
        .map((w) => w[0])
        .join("")
        .toUpperCase()}`
    : words
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

/** The current academic year as "2026-2027". */
export function currentAcademicYear() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

/** Midnight on the first day of the month containing `ts`. */
export function startOfMonth(ts = Date.now()) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/** Inline an SVG string as an image URL. */
export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
