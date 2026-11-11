import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "iconoir-react";
import Button from "../components/Button";
import { ApiError } from "../lib/api";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { onBookmarkAdded, onBookmarkUpdated, onCollectionAdded, onCollectionRemoved, onCollectionUpdated, onNavigate, onSearch, type SidebarView } from "../lib/events";
import type { Bookmark, Collection } from "../types";
import Layout from "./Layout";
import BookmarkCard from "../components/BookmarkCard";
import BookmarkFilters from "../components/BookmarkFilters";
import FilterToggle from "../components/FilterToggle";
import CollectionOptionsMenu from "../components/CollectionOptionsMenu";
import EditCollectionModal from "../components/EditCollectionModal";
import {
  DEFAULT_FILTERS,
  isFilterActive,
  type BookmarkFilterState,
} from "../lib/bookmarkFilters";

const FILTERS_OPEN_KEY = "markit:filtersOpen";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [view, setView] = useState<SidebarView>({ type: "all" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookmarkFilterState>(DEFAULT_FILTERS);
  const [now] = useState(() => Date.now());
  const [loadError, setLoadError] = useState("");
  const [renaming, setRenaming] = useState<Collection | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(FILTERS_OPEN_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_OPEN_KEY, String(filtersOpen));
    } catch {
      // storage unavailable (private mode, blocked) — the toggle still works
    }
  }, [filtersOpen]);

  // Load initial data. Only a 401 ends the session; other failures show an
  // error with retry instead of bouncing between / and /dashboard.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError("");
      try {
        const [cols, marks] = await Promise.all([
          collectionsService.list(),
          bookmarksService.list(),
        ]);
        if (cancelled) return;
        setCollections(cols);
        setBookmarks(marks);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Couldn't load your bookmarks.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  // Sync lists when Sidebar modals create new items
  useEffect(() => {
    const offBookmark = onBookmarkAdded((b) =>
      setBookmarks((prev) => [b, ...prev])
    );
    const offBookmarkUpdated = onBookmarkUpdated((b) =>
      setBookmarks((prev) => prev.map((x) => (x.id === b.id ? b : x)))
    );
    const offCollection = onCollectionAdded((c) =>
      setCollections((prev) => [...prev, c])
    );
    const offCollectionUpdated = onCollectionUpdated((c) =>
      setCollections((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...c } : x)))
    );
    const offCollectionRemoved = onCollectionRemoved((id) => {
      setCollections((prev) => prev.filter((x) => x.id !== id));
      // Bookmarks of a deleted collection stay in the account, without a collection.
      setBookmarks((prev) => prev.map((b) => (b.collection_id === id ? { ...b, collection_id: null } : b)));
    });
    const offNavigate = onNavigate(setView);
    const offSearch = onSearch(setSearchQuery);
    return () => { offBookmark(); offBookmarkUpdated(); offCollection(); offCollectionUpdated(); offCollectionRemoved(); offNavigate(); offSearch(); };
  }, []);

  async function handleDelete(id: number) {
    await bookmarksService.remove(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  const q = searchQuery.trim().toLowerCase();

  const domains = Array.from(
    new Set(bookmarks.map((b) => b.domain).filter((d): d is string => !!d))
  ).sort((a, b) => a.localeCompare(b));

  const filtered = (() => {
    let list = bookmarks;
    if (view.type === "collection")
      list = list.filter((b) => b.collection_id === view.id);
    if (q)
      list = list.filter((b) =>
        (b.title ?? "").toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q) ||
        (b.url).toLowerCase().includes(q) ||
        (b.domain ?? "").toLowerCase().includes(q)
      );
    if (filters.domain)
      list = list.filter((b) => b.domain === filters.domain);
    if (filters.savedWithin !== "any") {
      const cutoff = now - Number(filters.savedWithin) * 24 * 60 * 60 * 1000;
      list = list.filter((b) => new Date(b.created_at).getTime() >= cutoff);
    }

    list = [...list];
    const savedAt = (b: Bookmark) => new Date(b.created_at).getTime();
    const titleOf = (b: Bookmark) => b.title ?? b.url;
    switch (filters.sort) {
      case "newest":
        list.sort((a, b) => savedAt(b) - savedAt(a));
        break;
      case "oldest":
        list.sort((a, b) => savedAt(a) - savedAt(b));
        break;
      case "title":
        list.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
        break;
      case "domain":
        list.sort((a, b) => (a.domain ?? "").localeCompare(b.domain ?? ""));
        break;
      case "default":
        // "All" is alphabetical; recents and collections keep newest-first order
        if (view.type === "all")
          list.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
        break;
    }
    return list;
  })();

  const narrowed = q !== "" || isFilterActive(filters);

  const activeCollection =
    view.type === "collection" ? collections.find((c) => c.id === view.id) : undefined;

  const heading =
    view.type === "collection"
      ? (collections.find((c) => c.id === view.id)?.name ?? "Bookmarks")
      : view.type === "recents"
      ? "Recents"
      : "All Bookmarks";

  return (
    <Layout>
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-visible">
        <div className="flex items-center justify-between gap-4 mb-4 p-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-2xl font-semibold text-stone-900 truncate">
              {heading}
              <span className="ml-2 text-stone-400 font-normal text-sm">
                {filtered.length}
              </span>
            </h2>
            {activeCollection && (
              <CollectionOptionsMenu collection={activeCollection} onRename={() => setRenaming(activeCollection)} />
            )}
          </div>
          <FilterToggle
            id="filters-toggle"
            open={filtersOpen}
            onToggle={setFiltersOpen}
            showDot={isFilterActive(filters)}
            controls="bookmark-filters"
          />
        </div>

        <BookmarkFilters
          open={filtersOpen}
          filters={filters}
          onChange={setFilters}
          domains={domains}
          resultCount={filtered.length}
        />

        {renaming && (
          <EditCollectionModal collection={renaming} onClose={() => setRenaming(null)} />
        )}

        {loadError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-stone-500">
            <p className="text-sm text-center px-4">{loadError}</p>
            <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-stone-400">
            <Globe width={36} height={36} />
            <p className="text-sm text-center px-4">
              {narrowed
                ? "No bookmarks match your search or filters."
                : "No bookmarks yet — paste a URL above to save one."}
            </p>
          </div>
        ) : (
          <div className="overflow-visible p-2 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                onDelete={() => handleDelete(b.id)}
                collectionName={collections.find((c) => c.id === b.collection_id)?.name}
              />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
