// Tiny store factory (cached in the browser, saved to the database via cloud-storage) used by the demo's client-side state.
import { cloudStorage } from "@/lib/cloud-storage";
import { useEffect, useState, useSyncExternalStore } from "react";

export function createLocalStore<T>(key: string, seed: T) {
  const event = `umunity:${key}`;

  function read(): T {
    if (typeof window === "undefined") return seed;
    try {
      const raw = cloudStorage.getItem(key);
      if (!raw) return seed;
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

  function useStore(): T {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);
    const snap = useSyncExternalStore(
      subscribe,
      () => JSON.stringify(read()),
      () => JSON.stringify(seed),
    );
    return hydrated ? (JSON.parse(snap) as T) : seed;
  }

  return { read, write, update, useStore };
}
