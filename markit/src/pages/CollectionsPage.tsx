import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkBook, Plus } from "iconoir-react";
import Button from "../components/Button";
import CollectionOptionsMenu from "../components/CollectionOptionsMenu";
import EditCollectionModal from "../components/EditCollectionModal";
import NewCollectionModal from "../components/NewCollectionModal";
import { ApiError } from "../lib/api";
import {
  emitNavigate,
  onCollectionAdded,
  onCollectionRemoved,
  onCollectionUpdated,
} from "../lib/events";
import { collectionsService } from "../services/collections";
import type { Collection } from "../types";
import Layout from "./Layout";

/** Mobile home for collections. Tapping one opens its bookmarks on the dashboard. */
export default function CollectionsPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [renaming, setRenaming] = useState<Collection | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    collectionsService
      .list()
      .then((cols) => {
        if (cancelled) return;
        setCollections(cols);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Couldn't load your collections.");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  useEffect(() => {
    const offAdded = onCollectionAdded((c) => setCollections((prev) => [...prev, c]));
    const offUpdated = onCollectionUpdated((c) =>
      setCollections((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...c } : x)))
    );
    const offRemoved = onCollectionRemoved((id) =>
      setCollections((prev) => prev.filter((x) => x.id !== id))
    );
    return () => {
      offAdded();
      offUpdated();
      offRemoved();
    };
  }, []);

  function openCollection(c: Collection) {
    emitNavigate({ type: "collection", id: c.id });
    navigate("/dashboard");
  }

  return (
    <Layout>
      {/* pb-28 on mobile keeps the last card clear of the bottom nav */}
      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-28 sm:px-6 sm:pt-6 md:px-10 md:pt-10 md:pb-10">
        <div className="flex items-center justify-between gap-4 mb-4 p-2">
          <div className="min-w-0">
            <h2 className="text-2xl font-brand font-bold text-stone-900">Collections</h2>
            {loaded && (
              <p className="text-sm text-stone-500">
                {collections.length} {collections.length === 1 ? "collection" : "collections"}
              </p>
            )}
          </div>
          <Button variant="secondary" size="sm" aria-label="New collection" onClick={() => setAdding(true)}>
            <Plus width={16} height={16} />
          </Button>
        </div>

        {loadError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-stone-500">
            <p className="text-sm text-center px-4">{loadError}</p>
            <Button variant="secondary" onClick={() => { setLoadError(""); setReloadKey((k) => k + 1); }}>
              Try again
            </Button>
          </div>
        ) : !loaded ? null : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold text-stone-900">No collections yet</p>
            <Button onClick={() => setAdding(true)}>New collection</Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 p-2 sm:gap-4">
            {collections.map((c) => (
              <li
                key={c.id}
                className="flex items-stretch rounded-3xl border border-stone-200 bg-white shadow-stone-100 transition-shadow hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => openCollection(c)}
                  className="flex-1 min-w-0 flex flex-col gap-4 p-5 text-left rounded-3xl outline-teal-500"
                >
                  <BookmarkBook width={28} height={28} strokeWidth={1.5} className="text-stone-700" aria-hidden="true" />
                  <span className="text-lg font-semibold text-stone-900 truncate">{c.name}</span>
                  <span className="text-sm text-stone-500">
                    {c.bookmark_count} {c.bookmark_count === 1 ? "bookmark" : "bookmarks"}
                  </span>
                </button>
                <div className="shrink-0 self-start p-3">
                  <CollectionOptionsMenu collection={c} onRename={() => setRenaming(c)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {renaming && (
        <EditCollectionModal collection={renaming} onClose={() => setRenaming(null)} />
      )}
      {adding && <NewCollectionModal onClose={() => setAdding(false)} />}
    </Layout>
  );
}
