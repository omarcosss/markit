import type { Bookmark, Collection } from "../types";

export type SidebarView =
  | { type: "all" }
  | { type: "recents" }
  | { type: "collection"; id: number };

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

export function emitBookmarkUpdated(bookmark: Bookmark) {
  window.dispatchEvent(new CustomEvent("bookmark:updated", { detail: bookmark }));
}

export function onBookmarkUpdated(handler: (b: Bookmark) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<Bookmark>).detail);
  window.addEventListener("bookmark:updated", listener);
  return () => window.removeEventListener("bookmark:updated", listener);
}

export function emitSearch(query: string) {
  window.dispatchEvent(new CustomEvent("search:query", { detail: query }));
}

export function onSearch(handler: (q: string) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<string>).detail);
  window.addEventListener("search:query", listener);
  return () => window.removeEventListener("search:query", listener);
}

export function emitNavigate(view: SidebarView) {
  window.dispatchEvent(new CustomEvent("sidebar:navigate", { detail: view }));
}

export function onNavigate(handler: (v: SidebarView) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<SidebarView>).detail);
  window.addEventListener("sidebar:navigate", listener);
  return () => window.removeEventListener("sidebar:navigate", listener);
}
