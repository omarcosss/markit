import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "iconoir-react";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { onBookmarkAdded, onBookmarkUpdated, onCollectionAdded, onNavigate, onSearch, type SidebarView } from "../lib/events";
import type { Bookmark, Collection } from "../types";
import Layout from "./Layout";
import BookmarkCard from "../components/BookmarkCard";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [view, setView] = useState<SidebarView>({ type: "all" });
  const [searchQuery, setSearchQuery] = useState("");

  // Load initial data; redirect home on 401
  useEffect(() => {
    async function load() {
      try {
        const [cols, marks] = await Promise.all([
          collectionsService.list(),
          bookmarksService.list(),
        ]);
        setCollections(cols);
        setBookmarks(marks);
      } catch {
        navigate("/", { replace: true });
      }
    }
    load();
  }, [navigate]);

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
    const offNavigate = onNavigate(setView);
    const offSearch = onSearch(setSearchQuery);
    return () => { offBookmark(); offBookmarkUpdated(); offCollection(); offNavigate(); offSearch(); };
  }, []);

  async function handleDelete(id: number) {
    await bookmarksService.remove(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  const q = searchQuery.trim().toLowerCase();

  const filtered = (() => {
    let list = bookmarks;
    if (view.type === "collection")
      list = list.filter((b) => b.collection_id === view.id);
    else if (view.type === "all")
      list = [...list].sort((a, b) =>
        (a.title ?? a.url).localeCompare(b.title ?? b.url)
      );
    // recents — preserve insertion order (newest first)
    if (q)
      list = list.filter((b) =>
        (b.title ?? "").toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q) ||
        (b.url).toLowerCase().includes(q) ||
        (b.domain ?? "").toLowerCase().includes(q)
      );
    return list;
  })();

  const heading =
    view.type === "collection"
      ? (collections.find((c) => c.id === view.id)?.name ?? "Bookmarks")
      : view.type === "recents"
      ? "Recents"
      : "All Bookmarks";

  return (
    <Layout>
      <main className="flex-1 flex flex-col overflow-hidden">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">
          {heading}
        
            <span className="ml-2 text-stone-400 font-normal text-sm">
              {filtered.length}
            </span>
          </h2>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-stone-400">
              <Globe width={36} height={36} />
              <p className="text-sm">No bookmarks yet — paste a URL above to save one.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
