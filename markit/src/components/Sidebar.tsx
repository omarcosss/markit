import { BookmarkBook, BookStack, ClockRotateRight, Plus } from "iconoir-react";
import Button from "./Button";
import { useEffect, useState, type ReactNode } from "react";
import type { Collection } from "../types";
import { collectionsService } from "../services/collections";
import { onCollectionAdded } from "../lib/events";
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
      className={`flex w-full items-center gap-3 px-4 py-3 rounded-full transition-colors ${
        active
          ? "text-teal-700 font-bold"
          : "text-stone-700 hover:bg-stone-100"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

type ModalView = "newBookmark" | "editBookmark" | "newCollection" | null;

export default function Sidebar() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalView>(null);

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
    <aside className="w-62 shrink-0 flex flex-col gap-3 px-3 py-4 h-full">

      <div className="px-2 pb-2">
        <Button size="md" className="w-full" onClick={() => setModal("newBookmark")}>
          <Plus />
          New Bookmark
        </Button>
      </div>

      <SidebarItem
        label="All Bookmarks"
        icon={<BookmarkBook />}
        active={selectedCollectionId === null}
        onClick={() => setSelectedCollectionId(null)}
      />
      <SidebarItem
        label="Recents"
        icon={<ClockRotateRight />}
        active={false}
        onClick={() => setSelectedCollectionId(null)}
      />

      <Divisor />

      <div className="px-4 pt-1">
        <h3 className="flex gap-2 items-center font-semibold text-stone-600">
          <BookStack />
          Collections
        </h3>
      </div>

      <div className="px-2">
        <Button size="sm" variant="secondary" className="w-full" onClick={() => setModal("newCollection")}>
          <Plus width={14} height={14} />
          New Collection
        </Button>
      </div>

      {collections.map((c) => (
        <SidebarItem
          key={c.id}
          label={c.name}
          active={selectedCollectionId === c.id}
          onClick={() => setSelectedCollectionId(c.id)}
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
