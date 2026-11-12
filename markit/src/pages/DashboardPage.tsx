import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Xmark } from "iconoir-react";
import Button from "../components/Button";
import { ApiError } from "../lib/api";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { emitSearch, getCurrentView, onOpenSearch, onBookmarkAdded, onBookmarkUpdated, onCollectionAdded, onCollectionRemoved, onCollectionUpdated, onNavigate, onSearch, type SidebarView } from "../lib/events";
import type { Bookmark, Collection } from "../types";
import Layout from "./Layout";
import BookmarkCard from "../components/BookmarkCard";
import BookmarkFilters from "../components/BookmarkFilters";
import FilterToggle from "../components/FilterToggle";
import CollectionOptionsMenu from "../components/CollectionOptionsMenu";
import EditCollectionModal from "../components/EditCollectionModal";
import NewBookmarkModal from "../components/NewBookmarkModal";
import Pagination from "../components/Pagination";
import {
  DEFAULT_FILTERS,
  isFilterActive,
  type BookmarkFilterState,
} from "../lib/bookmarkFilters";

const FILTERS_OPEN_KEY = "markit:filtersOpen";
const PAGE_SIZE_KEY = "markit:pageSize";
// Multiples of 16 so the 4-column grid always ends on a full row.
const PAGE_SIZE_OPTIONS = [16, 32, 48, 64];
const DEFAULT_PAGE_SIZE = 16;

function readPageSize(): number {
  try {
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
    return PAGE_SIZE_OPTIONS.includes(saved) ? saved : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // Starts on whatever view the nav chose before this page mounted (e.g. a collection opened from the Collections page).
  const [view, setView] = useState<SidebarView>(getCurrentView);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookmarkFilterState>(DEFAULT_FILTERS);
  const [now] = useState(() => Date.now());
  const [loadError, setLoadError] = useState("");
  const [renaming, setRenaming] = useState<Collection | null>(null);
  const [addingBookmark, setAddingBookmark] = useState(false);
  const location = useLocation();
  // Opens on mount when the bottom nav's Search button navigated here.
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(
    () => location.state?.openSearch === true
  );
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(readPageSize);
  const listRef = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(FILTERS_OPEN_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Search from the bottom nav while this page is already mounted.
  useEffect(
    () =>
      onOpenSearch(() => {
        setMobileSearchOpen(true);
        mobileSearchRef.current?.focus();
      }),
    []
  );

  // Focus the field whenever it appears.
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    emitSearch("");
  }

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamp in case the list shrank (a delete, or a smaller page size) while on a later page.
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Going back to the first page whenever what's listed changes. Adjusting state
  // during render (instead of in an effect) avoids an extra render pass.
  const listKey = `${view.type}:${view.type === "collection" ? view.id : ""}|${q}|${filters.domain}|${filters.savedWithin}|${filters.sort}`;
  const [pageListKey, setPageListKey] = useState(listKey);
  if (pageListKey !== listKey) {
    setPageListKey(listKey);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
    try {
      localStorage.setItem(PAGE_SIZE_KEY, String(size));
    } catch {
      // storage unavailable — the choice lasts for this visit only
    }
  }

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
      {/* pb-28 on mobile keeps the last row clear of the bottom nav */}
      <main className="flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pt-6 md:px-10 md:pt-10 md:pb-10 flex flex-col overflow-y-auto overflow-x-visible">
        <div className="flex items-center justify-between gap-4 mb-4 p-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <h2 className="text-2xl flex flex-wrap text-wrap gap-3 items-center font-brand font-bold align-middle text-stone-900 truncate">
                {heading}
                <span className="hidden md:inline text-stone-600 font-normal text-xs px-4 py-2 bg-stone-100 rounded-full">
                  {filtered.length} bookmarks
                </span>
              </h2>
              <p className="md:hidden text-sm text-stone-500">{filtered.length} bookmarks</p>
            </div>
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

        {mobileSearchOpen && (
          <div className="md:hidden flex items-center gap-2 h-12 mb-4 pl-4 pr-2 rounded-2xl border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-teal-500">
            <Search width={18} height={18} className="shrink-0 text-stone-600" aria-hidden="true" />
            <input
              ref={mobileSearchRef}
              type="search"
              aria-label="Search bookmarks"
              placeholder="Search bookmarks…"
              value={searchQuery}
              onChange={(e) => emitSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeMobileSearch()}
              className="flex-1 min-w-0 bg-transparent text-[16px] text-stone-900 outline-none"
            />
            <Button variant="ghost" size="sm" aria-label="Close search" onClick={closeMobileSearch}>
              <Xmark width={16} height={16} strokeWidth={2} />
            </Button>
          </div>
        )}

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

        {addingBookmark && (
          <NewBookmarkModal onClose={() => setAddingBookmark(false)} />
        )}

        {loadError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-stone-500">
            <p className="text-sm text-center px-4">{loadError}</p>
            <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center  gap-8 py-12 ">
            <img src="/empty-state-doodle.svg" />
            <p className="text-lg font-semibold text-center px-4">
              {narrowed
                ? <span>No bookmarks match your search or filters...</span>
                : <span>No bookmarks yet. <button type="button" onClick={() => setAddingBookmark(true)} className="text-teal-500 cursor-pointer underline ">Try pasting a link to start.</button></span>}
            </p>
          </div>
        ) : (
          <>
            <div ref={listRef} className="overflow-visible p-2 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((b) => (
                <BookmarkCard
                  key={b.id}
                  bookmark={b}
                  onDelete={() => handleDelete(b.id)}
                  collectionName={collections.find((c) => c.id === b.collection_id)?.name}
                />
              ))}
            </div>
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              total={filtered.length}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          </>
        )}
      </main>
    </Layout>
  );
}
