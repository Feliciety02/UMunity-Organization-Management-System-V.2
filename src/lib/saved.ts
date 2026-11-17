// Bookmarked posts and events (saved to the database via cloud-storage).
import { createLocalStore } from "@/lib/local-store";

type SavedState = { posts: string[]; events: string[] };

const store = createLocalStore<SavedState>("umunity.saved.v1", {
  posts: ["p1", "p2"],
  events: ["Eco Run for the Planet"],
});

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Returns true when the post is saved after toggling. */
export function toggleSavedPost(id: string) {
  const next = toggle(store.read().posts, id);
  store.update((s) => ({ ...s, posts: next }));
  return next.includes(id);
}

/** Returns true when the event is saved after toggling. */
export function toggleSavedEvent(title: string) {
  const next = toggle(store.read().events, title);
  store.update((s) => ({ ...s, events: next }));
  return next.includes(title);
}

export const useSaved = store.useStore;
