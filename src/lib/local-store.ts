// The one store helper for client-side data: cached in the browser, saved to the database via
// cloud-storage, and re-read by every component when it changes (in this tab or another).
import { cloudStorage } from "@/lib/cloud-storage";
import { useEffect, useState, useSyncExternalStore } from "react";

export function createLocalStore<T>(key: string, seed: T, opts: { saveSeed?: boolean } = {}) {
  const event = `umunity:${key}`;

  function read(): T {
    if (typeof window === "undefined") return seed;
    try {
      const raw = cloudStorage.getItem(key);
      if (!raw) {
        // Stores the server doesn't seed keep their starting data, so it's saved on first use.
        if (opts.saveSeed) cloudStorage.setItem(key, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw) as T;
    } catch {
      return seed;
    }
  }

  function write(next: T) {
    if (typeof window === "undefined") return;
    try {
      cloudStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode); state still updates for this tab.
    }
    window.dispatchEvent(new Event(event));
  }

  function update(fn: (current: T) => T) {
    write(fn(read()));
  }

  function subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(event, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(event, cb);
      window.removeEventListener("storage", cb);
    };
  }

  /**
   * A view of the store that re-renders when it changes. `select` reads the store (e.g. sorted or
   * filtered); `fallback` is what the server render and the first client render show.
   */
  function useSelect<R>(select: () => R, fallback: R): R {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);
    const snap = useSyncExternalStore(
      subscribe,
      () => JSON.stringify(select()),
      () => JSON.stringify(fallback),
    );
    return hydrated ? (JSON.parse(snap) as R) : fallback;
  }

  function useStore(): T {
    return useSelect(read, seed);
  }

  return { read, write, update, useStore, useSelect };
}
