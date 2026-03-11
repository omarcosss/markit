import type { Bookmark, Collection } from "../types";

export function emitBookmarkAdded(bookmark: Bookmark) {
  window.dispatchEvent(new CustomEvent("bookmark:added", { detail: bookmark }));
}

export function emitCollectionAdded(collection: Collection) {
  window.dispatchEvent(
    new CustomEvent("collection:added", { detail: collection }),
  );
}

export function onBookmarkAdded(handler: (b: Bookmark) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<Bookmark>).detail);
  window.addEventListener("bookmark:added", listener);
  return () => window.removeEventListener("bookmark:added", listener);
}

export function onCollectionAdded(handler: (c: Collection) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<Collection>).detail);
  window.addEventListener("collection:added", listener);
  return () => window.removeEventListener("collection:added", listener);
}
