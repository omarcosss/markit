import { BookmarkBook, ClockRotateRight, Plus } from "iconoir-react";
import Button from "./Button";
import { useEffect, useState, type ReactNode } from "react";
import type { Collection } from "../types";
import { collectionsService } from "../services/collections";
import { emitNavigate, getCurrentView, onCollectionAdded, type SidebarView } from "../lib/events";
import { useNavigate } from "react-router-dom";
import Divisor from "./Divisor";
import NewBookmarkModal from "./NewBookmarkModal";
import NewCollectionModal from "./NewCollectionModal";

function SidebarItem({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
        active
          ? "text-teal-700 font-semibold bg-white/50 border-white shadow-brand"
          : "text-stone-700 hover:bg-stone-100 hover:text-stone-900 border-transparent"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

type ModalView = "newBookmark" | "editBookmark" | "newCollection" | null;

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [view, setView] = useState<SidebarView>(getCurrentView);
  const [modal, setModal] = useState<ModalView>(null);

  function navigate_to(v: SidebarView) {
    setView(v);
    emitNavigate(v);
    onNavigate?.();
  }

  useEffect(() => {
    async function load() {
      try {
        const cols = await collectionsService.list();
        setCollections(cols);
      } catch {
        navigate("/", { replace: true });
      }
    }
    load();
  }, [navigate]);

  useEffect(() => {
    return onCollectionAdded((col) =>
      setCollections((prev) => [...prev, col])
    );
  }, []);

  return (
    <aside className="w-72 md:w-62 shrink-0 flex flex-col gap-3 px-3 py-4 h-full">
      <SidebarItem
        label="All Bookmarks"
        icon={<BookmarkBook />}
        active={view.type === "all"}
        onClick={() => navigate_to({ type: "all" })}
      />
      <SidebarItem
        label="Recents"
        icon={<ClockRotateRight />}
        active={view.type === "recents"}
        onClick={() => navigate_to({ type: "recents" })}
      />

      <Divisor />

      <div className="px-4 pt-1 flex justify-between">
        <h3 className="flex gap-2 items-center font-semibold text-stone-600">
          {/* <BookStack /> */}
          Collections
        </h3>
        <Button size="sm" variant="secondary" title="Add new collection" onClick={() => setModal("newCollection")}>
          <Plus width={14} height={14} />
        </Button>
      </div>

      <div className="px-2">
      </div>

      {collections.map((c) => (
        <SidebarItem
          key={c.id}
          label={c.name}
          active={view.type === "collection" && view.id === c.id}
          onClick={() => navigate_to({ type: "collection", id: c.id })}
        />
      ))}


      {modal === "newBookmark" && (
        <NewBookmarkModal onClose={() => setModal(null)} />
      )}
      {modal === "newCollection" && (
        <NewCollectionModal onClose={() => setModal(null)} />
      )}
    </aside>
  );
}
