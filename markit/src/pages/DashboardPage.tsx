import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Xmark } from "iconoir-react";
import { bookmarksService } from "../services/bookmarks";
import { collectionsService } from "../services/collections";
import { onBookmarkAdded, onCollectionAdded } from "../lib/events";
import type { Bookmark, Collection } from "../types";
import Layout from "./Layout";
import BookmarkCard from "../components/BookmarkCard";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCollectionId, _setSelectedCollectionId] = useState<number | null>(null);

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
    const offCollection = onCollectionAdded((c) =>
      setCollections((prev) => [...prev, c])
    );
    return () => { offBookmark(); offCollection(); };
  }, []);

  async function handleDelete(id: number) {
    await bookmarksService.remove(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  const filtered =
    selectedCollectionId === null
      ? bookmarks
      : bookmarks.filter((b) => b.collection_id === selectedCollectionId);

  const heading =
    selectedCollectionId === null
      ? "All bookmarks"
      : (collections.find((c) => c.id === selectedCollectionId)?.name ?? "Bookmarks");

  return (
    <Layout>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-4">
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
                <BookmarkCard key={b.id} bookmark={b} onDelete={() => handleDelete(b.id)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function BookmarkCardaa({
  bookmark,
  onDelete,
}: {
  bookmark: Bookmark;
  onDelete: () => void;
}) {
  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      {bookmark.thumbnail ? (
        <img
          src={bookmark.thumbnail}
          alt=""
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-stone-100 flex items-center justify-center">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="w-8 h-8" />
          ) : (
            <Globe width={28} height={28} className="text-stone-300" />
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-3 flex-1">
        <p className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug">
          {bookmark.title ?? bookmark.domain ?? bookmark.url}
        </p>
        {bookmark.domain && (
          <p className="mt-1 text-xs text-stone-400 truncate flex items-center gap-1">
            {bookmark.favicon && (
              <img src={bookmark.favicon} alt="" className="w-3 h-3 inline" />
            )}
            {bookmark.domain}
          </p>
        )}
      </div>

      {/* Delete — visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        aria-label="Delete bookmark"
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-white border border-stone-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 hover:text-red-500"
      >
        <Xmark width={12} height={12} />
      </button>
    </a>
  );
}
