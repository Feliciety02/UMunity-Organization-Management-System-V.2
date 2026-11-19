import { describe, expect, it } from "vitest";
import {
  canWrite,
  diffEntries,
  isSyncedKey,
  itemKeyOf,
  toEntries,
  type DocKind,
} from "@/lib/synced-keys";

function baseOf(value: unknown) {
  const split = toEntries(value)!;
  const items = new Map<string, { json: string; pos: number; ver: number }>();
  split.entries.forEach(([k, v], i) =>
    items.set(k, { json: JSON.stringify(v), pos: (i + 1) * 1024, ver: 3 }),
  );
  return { kind: split.kind as DocKind, items };
}

describe("item identity", () => {
  it("uses id, then slug, then eventTitle", () => {
    expect(itemKeyOf({ id: "a", slug: "b" })).toBe("a");
    expect(itemKeyOf({ slug: "b" })).toBe("b");
    expect(itemKeyOf({ eventTitle: "Eco Run" })).toBe("Eco Run");
    expect(itemKeyOf({ name: "x" })).toBeNull();
    expect(itemKeyOf("text")).toBeNull();
  });

  it("only splits lists whose items all have unique identities", () => {
    expect(toEntries([{ id: "a" }, { id: "b" }])?.kind).toBe("array");
    expect(toEntries([{ id: "a" }, { id: "a" }])).toBeNull();
    expect(toEntries([{ id: "a" }, { name: "no id" }])).toBeNull();
    expect(toEntries({ posts: [], events: [] })?.kind).toBe("object");
    expect(toEntries("plain")).toBeNull();
  });
});

describe("diffEntries", () => {
  const base = baseOf([
    { id: "a", v: 1 },
    { id: "b", v: 1 },
    { id: "c", v: 1 },
  ]);

  it("sends only the item that changed", () => {
    const patch = diffEntries(
      base,
      toEntries([
        { id: "a", v: 1 },
        { id: "b", v: 2 },
        { id: "c", v: 1 },
      ])!,
    )!;
    expect(patch.upserts.map((u) => u.k)).toEqual(["b"]);
    expect(patch.upserts[0].pos).toBe(2048); // keeps its position
    expect(patch.upserts[0].ver).toBe(3); // based on the version it was loaded at
    expect(patch.deletes).toEqual([]);
  });

  it("places a prepended item before the first one without touching the others", () => {
    const patch = diffEntries(
      base,
      toEntries([{ id: "new" }, { id: "a", v: 1 }, { id: "b", v: 1 }, { id: "c", v: 1 }])!,
    )!;
    expect(patch.upserts).toHaveLength(1);
    expect(patch.upserts[0].k).toBe("new");
    expect(patch.upserts[0].ver).toBe(0);
    expect(patch.upserts[0].pos).toBeLessThan(1024);
  });

  it("places an inserted item between its neighbours", () => {
    const patch = diffEntries(
      base,
      toEntries([{ id: "a", v: 1 }, { id: "mid" }, { id: "b", v: 1 }, { id: "c", v: 1 }])!,
    )!;
    expect(patch.upserts[0].pos).toBeGreaterThan(1024);
    expect(patch.upserts[0].pos).toBeLessThan(2048);
  });

  it("deletes removed items", () => {
    const patch = diffEntries(
      base,
      toEntries([
        { id: "a", v: 1 },
        { id: "c", v: 1 },
      ])!,
    )!;
    expect(patch.deletes).toEqual([{ k: "b", ver: 3 }]);
    expect(patch.upserts).toEqual([]);
  });

  it("re-numbers everything when the order changes", () => {
    const patch = diffEntries(
      base,
      toEntries([
        { id: "c", v: 1 },
        { id: "a", v: 1 },
        { id: "b", v: 1 },
      ])!,
    )!;
    expect(patch.upserts.map((u) => [u.k, u.pos])).toEqual([
      ["c", 1024],
      ["a", 2048],
      ["b", 3072],
    ]);
  });

  it("diffs objects field by field", () => {
    const objBase = baseOf({ posts: ["p1"], events: [] });
    const patch = diffEntries(objBase, toEntries({ posts: ["p1", "p2"], events: [] })!)!;
    expect(patch.kind).toBe("object");
    expect(patch.upserts.map((u) => u.k)).toEqual(["posts"]);
  });

  it("refuses to diff across shapes", () => {
    expect(diffEntries(base, toEntries({ a: 1 })!)).toBeNull();
  });
});

describe("write permissions", () => {
  it("lets every role write its own data", () => {
    expect(canWrite("umunity.saved.v1", "student")).toBe(true);
  });
  it("keeps students out of staff and admin stores", () => {
    expect(canWrite("umunity.workflows.v1", "student")).toBe(false);
    expect(canWrite("umunity.workflows.v1", "leader")).toBe(true);
    expect(canWrite("umunity.admin.pending-orgs.v1", "leader")).toBe(false);
    expect(canWrite("umunity.admin.pending-orgs.v1", "admin1")).toBe(true);
    expect(canWrite("umunity.notifications.v2", "student")).toBe(true);
  });
  it("rejects unknown keys", () => {
    expect(isSyncedKey("umunity.anything")).toBe(false);
  });
});
